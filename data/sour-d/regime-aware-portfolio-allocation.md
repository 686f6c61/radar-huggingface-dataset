# sour-d/regime-aware-portfolio-allocation

## Resumen

`sour-d/regime-aware-portfolio-allocation` es un artefacto de aprendizaje por refuerzo profundo (deep RL) publicado en Hugging Face por el usuario `sour-d` (Sourav Das), fruto de un proyecto de tesis de master en el Indian Institute of Technology Patna (IIT Patna). No es un modelo de lenguaje: es un agente de control continuo entrenado con Stable-Baselines3 (PPO/SAC) para asignar dinámicamente pesos entre tres activos cotizados indios (renta variable, oro y liquidez) condicionado por el régimen de mercado inferido en tiempo real.

La propuesta tecnica central es una arquitectura desacoplada en dos etapas: un modelo oculto de Markov gaussiano (HMM) que detecta de forma no supervisada el regimen latente (Bull, Sideways, Crisis Shock) a partir de volatilidad realizada y retornos en ventana movil, y un agente RL que recibe el vector de probabilidad posterior del HMM como parte del estado. El entorno Gymnasium personalizado impone la simplex de probabilidad mediante proyeccion softmax, costes de transaccion proporcionales (10 pb), slippage (2 pb) y modelado de recompensa con CVaR al 95%.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigadores que quieran evaluar politicas RL condicionadas por regimen frente a baselines institucionales (Equal-Weight 1/N, Markowitz MVO y agentes RL sin informacion de regimen) bajo validacion cruzada walk-forward. El repositorio pesa 0.0 GB y acumula 18 descargas, lo que sugiere que el peso del agente puede estar en el repositorio GitHub asociado o que el artefacto alojado es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control continuo (PPO/SAC de Stable-Baselines3) condicionado por HMM gaussiano para deteccion de regimen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado se construye a partir de ventanas moviles de indicadores) |
| Tipos de cuantizacion | no disponible (no aplica a un agente RL de este tipo) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria declarada: `stable-baselines3`; el artefacto tipico seria un `.zip` de SB3, pero no se confirma en la informacion) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. Primero, un Gaussian Hidden Markov Model calibrado sobre volatilidad realizada y retornos en ventana movil, que infiere regimenes latentes de mercado (Bull, Sideways, Crisis Shock) sin look-ahead bias, es decir, usando unicamente informacion disponible en cada instante. Segundo, una politica de control continuo PPO o SAC cuya red se condiciona con el vector de probabilidad posterior del HMM, de forma que la asignacion de cartera cambia segun el regimen detectado.

El entorno `PortfolioEnv` (Gymnasium) implementa la proyeccion softmax para garantizar que los pesos sumen uno y permanezcan en la simplex, aplica costes de transaccion proporcionales de 10 puntos basicos y slippage de 2 puntos basicos, y moldea la recompensa con CVaR al 95% para penalizar colas de perdida. La evaluacion se realiza mediante validacion cruzada walk-forward contra baselines: cartera equiponderada (1/N), optimizacion de media-varianza de Markowitz y agentes RL sin informacion de regimen. El universo de activos es el mercado indio: `NIFTYBEES.NS` (renta variable), `GOLDBEES.NS` (oro como refugio) y `LIQUIDBEES.NS` (liquidez), con `^NSEI` como benchmark. No se especifican en la informacion el numero de pasos de entrenamiento, el tamano de las redes ni la composicion exacta del dataset mas alla de los indicadores mencionados.

## Capacidades

- Asignacion dinamica de pesos entre tres activos (renta variable, oro y liquidez) con pesos restringidos a la simplex de probabilidad.
- Deteccion no supervisada de regimenes de mercado (Bull, Sideways, Crisis Shock) mediante HMM gaussiano sobre volatilidad realizada y retornos.
- Condicionamiento de la politica por el vector posterior de regimen en tiempo real, sin look-ahead bias.
- Modelado explicito de fricciones de mercado: costes de transaccion de 10 pb y slippage de 2 pb.
- Optimizacion con modelado de riesgo de cola mediante CVaR al 95%.
- Evaluacion walk-forward contra baselines institucionales (1/N, Markowitz MVO, RL sin regimen).
- Metricas de evaluacion declaradas: Sharpe ratio, Sortino ratio, max drawdown y Calmar ratio.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Investigacion academica en finanzas cuantitativas: reproduccion del pipeline completo (`make data`, `make regime`, `make train`, `make evaluate`) para estudiar el efecto del condicionamiento por regimen en politicas RL de asignacion.
- Benchmarking de agentes RL frente a metodos clasicos: comparar la politica entrenada con Markowitz MVO y 1/N bajo las mismas fricciones (10 pb + 2 pb) y la misma validacion walk-forward.
- Prototipado de estrategias de asignacion tactica en mercados emergentes: el universo indio (NIFTYBEES, GOLDBEES, LIQUIDBEES) sirve como caso de estudio de rotacion entre renta variable, refugio y liquidez.
- Estudio de deteccion de regimenes: reutilizar el HMM gaussiano sobre volatilidad realizada como modulo independiente para clasificar estados de mercado en otros activos.
- Docencia en RL aplicado: el `PortfolioEnv` con proyeccion softmax, costes y CVaR es un ejemplo didactico de diseno de entornos Gymnasium con restricciones realistas.
- Analisis de sensibilidad a fricciones: modificar los 10 pb de coste y 2 pb de slippage para medir como varia la politica optima y el drawdown maximo.
- Evaluacion de riesgo de cola: usar el modelado CVaR al 95% como plantilla para incorporar penalizaciones de cola en otras tareas de control financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas de evaluacion (Sharpe, Sortino, max drawdown, Calmar) y los baselines de comparacion (1/N, Markowitz MVO, RL sin regimen), pero no incluye cifras numericas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un agente RL tabular/neuronal de pequeno tamano sobre tres activos, la inferencia es viable en CPU.
- GPU recomendadas: no disponible; no se especifican requisitos. Para entrenamiento PPO/SAC de redes pequenas, una GPU consumer (por ejemplo RTX 3060 o superior) seria mas que suficiente, aunque no se confirma en la informacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del problema (tres activos, estado basado en indicadores), aunque no se documenta.
- Opciones de despliegue: Stable-Baselines3 (libreria declarada), con pipeline orquestado mediante `make` y Python 3 con entorno virtual. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Activos | Contexto/estado | Fricciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sour-d/regime-aware-portfolio-allocation` | PPO/SAC + HMM de regimen | 3 ETF indios | Ventana movil de indicadores + posterior HMM | 10 pb coste + 2 pb slippage + CVaR 95% | MIT | Hugging Face + GitHub |
| Markowitz MVO (baseline clasico) | Optimizacion media-varianza | Configurable | Estimaciones muestrales | No modeladas por defecto | N/A | Implementacion propia |
| Equal-Weight 1/N (baseline) | Regla fija | Configurable | Ninguno | No modeladas | N/A | Trivial |
| Agente RL sin regimen (baseline del propio autor) | PPO/SAC | 3 ETF indios | Sin posterior HMM | 10 pb + 2 pb + CVaR 95% | MIT (presumible) | GitHub del autor |

No se dispone de datos numericos de rendimiento para establecer una comparativa cuantitativa con alternativas como FinRL u otros frameworks de RL financiero.

## Limitaciones y advertencias

- Sesgo de universo: el agente esta entrenado exclusivamente sobre tres ETF del mercado indio; su generalizacion a otros mercados o activos no esta validada.
- Riesgo de sobreajuste historico: aunque se emplea validacion walk-forward, el HMM y la politica se calibran sobre un periodo historico concreto cuyas caracteristicas pueden no repetirse.
- Sin datos de rendimiento publicados: no hay cifras de Sharpe, Sortino, drawdown ni Calmar en la informacion, por lo que no es posible verificar la calidad de la politica.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, vision, audio, tool calling ni capacidades multilingues.
- Uso no apto para produccion sin validacion adicional: es un proyecto de tesis de master; no se documentan controles de robustez, pruebas de estres ni monitorizacion.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, la ausencia de garantias es explicita en la propia licencia.
- Fricciones modeladas de forma simplificada: 10 pb de coste y 2 pb de slippage pueden subestimar el impacto de mercado en tamanos de orden grandes.
- Dependencia de la calidad del HMM: una mala calibracion del detector de regimen propaga errores directamente a la politica.
- Repositorio de 0.0 GB y 18 descargas: la disponibilidad y el soporte de la comunidad son muy limitados; conviene verificar el repositorio GitHub para obtener los artefactos reales.

## Enlaces

- Hugging Face: https://huggingface.co/sour-d/regime-aware-portfolio-allocation
- Repositorio GitHub: https://github.com/sour-d/MS-Thesis
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Gymnasium: https://gymnasium.farama.org/
- Paper o blog adicional: no disponible en la informacion proporcionada.
