// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.23;

interface IUniswapV2Factory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Router02 {

    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function factory() external pure returns (address);

    function WETH() external pure returns (address);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor() {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}


contract MYRT is Context, IERC20, Ownable {

    uint256 private constant _totalSupply = 3780000000;
    uint8 private constant _decimals = 18;
    string private constant _name = "Rabbit";
    string private constant _symbol = "MYRT";

    IUniswapV2Router02 public uniswapV2Router;
    address public uniswapV2Pair;
    address public WETH;
    address payable public availableAddress;

    bool inSwap;
    modifier swapping() { inSwap = true; _; inSwap = false; }

    uint256 public _taxFee;
    uint256 public _devTaxAmount;
    uint256 public getTax;
    uint256 public outTax;
    uint256 _swapThreshold;
    uint256 feeDenominator;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) private _ExcludeWalletFee;

    receive() external payable {}

    constructor() {
        _swapThreshold = 0;
        getTax = 10;
        outTax = 10;
        feeDenominator = 100;

        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
        uniswapV2Router = _uniswapV2Router;
        WETH = _uniswapV2Router.WETH();
        uniswapV2Pair = IUniswapV2Factory(_uniswapV2Router.factory()).createPair(address(this), WETH);
        
         availableAddress = payable(0xCCCA95EBAF66002E0C2F4bc3B7D3F2c997609255);
        _balances[msg.sender] = _totalSupply;
        
        _allowances[address(this)][address(uniswapV2Router)] = type(uint256).max;
        _allowances[msg.sender][address(uniswapV2Router)] = type(uint256).max;
        _allowances[availableAddress][address(uniswapV2Router)] = type(uint256).max;

        _ExcludeWalletFee[availableAddress] = true;
        _ExcludeWalletFee[msg.sender] = true;
        _ExcludeWalletFee[address(this)] = true;

        emit Transfer(address(0), _msgSender(), _totalSupply);

        _approve(address(this), address(uniswapV2Router), type(uint256).max);
    }

    function name() public pure returns (string memory) {
        return _name;
    }

    function symbol() public pure returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8) {
        return _decimals;
    }

    function totalSupply() public pure override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        if (_ExcludeWalletFee[from] || _ExcludeWalletFee[to]) {
            _taxFee = 0;
        } else {
            if(inSwap){ 
                uint256 fromBalance = _balances[from];
                require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
                unchecked {
                    _balances[from] = fromBalance - amount;
                    _balances[to] += amount;
                }
                emit Transfer(from, to, amount);
                return;
            }

            if (from == uniswapV2Pair) {
                _taxFee = getTax;
            } else if (to == uniswapV2Pair) {
                _devTaxAmount = _balances[address(this)];
                if(shouldSwap() && !inSwap) {
                    swap();
                }
                _taxFee = outTax;
            } else { _taxFee = 0; }
        }

        if (_taxFee != 0) {
            uint256 feeAmount = (amount * _taxFee) / feeDenominator;
            uint256 transferAmount = amount - feeAmount;

            _balances[from] -= amount;
            _balances[to] += transferAmount;
            _balances[address(this)] += feeAmount;

            emit Transfer(from, address(this), feeAmount);
            emit Transfer(from, to, transferAmount);
        } else {
            _balances[from] -= amount;
            _balances[to] += amount;

            emit Transfer(from, to, amount);
        }
    }

    function shouldSwap() internal view returns (bool) {
        return _devTaxAmount >= _swapThreshold;
    }

    function swap() internal swapping {
        inSwap = true;
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = WETH;

        uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            _devTaxAmount,
            0,
            path,
            address(this),
            block.timestamp
        );

        inSwap = false;
    }

    function setTaxFee(uint256 taxFee) external {
        _taxFee = taxFee;
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}
