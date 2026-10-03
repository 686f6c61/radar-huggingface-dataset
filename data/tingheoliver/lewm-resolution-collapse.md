# TingheOliver/lewm-resolution-collapse

## Resumen

`lewm-resolution-collapse` es un repositorio de checkpoints auxiliares publicado por el usuario TingheOliver en HuggingFace; no es un modelo generativo ni un modelo de lenguaje. Acompaña al estudio *Resolution Collapse in Latent-Space CEM*, que investiga por qué los planificadores CEM que ordenan candidatos mediante un world model LeWM preentrenado pierden toda señal de ordenación justo en el fotograma terminal que optimizan, y cómo corregirlo. La planificación en sí se apoya en los checkpoints oficiales de LeWM (`quentinll/lewm-tworooms`, `-pusht`, `-reacher` y `-cube`); este repositorio contiene únicamente las redes entrenadas como parte del trabajo, todas ellas operando sobre el espacio latente congelado de LeWM.

El repositorio incluye dos familias de artefactos: predictores de novedad por destilación de red aleatoria (RND) por entorno, empleados como baseline externo en el experimento de control de reemplazo, y sondas lineales de estado que decodifican variables físicas (propiocepción y pose de objetos) directamente desde el embedding latente de LeWM. Todos los pesos se distribuyen en formato PyTorch (`.pt`), acompañados de ficheros JSON con las métricas held-out correspondientes.

Es relevante para investigadores en world models, aprendizaje por refuerzo basado en modelo y planificación en espacio latente, ya que aporta artefactos reproducibles para auditar representaciones JEPA y el comportamiento de planificadores CEM. La licencia es MIT y no se declaran idiomas ni benchmarks de generación de texto, porque el modelo base no es lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes auxiliares por entorno: predictor RND y sondas lineales, operando sobre el espacio latente congelado de LeWM (arquitectura JEPA) |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros; tamano del repo en HuggingFace: 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume embeddings latentes de fotogramas) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, `torch.save`), con ficheros JSON de métricas asociados |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el world model base: LeWM permanece congelado y actúa como extractor de representaciones latentes. Sobre ese espacio latente se entrenan dos tipos de redes. El primero es un predictor de destilación de red aleatoria (RND) por entorno (`{env}_rnd.pt`), entrenado con latentes de LeWM procedentes del dataset de expertos real de cada entorno y utilizado como baseline de novedad externo en el experimento de control de reemplazo. El JSON asociado registra el error de reconstrucción dentro de distribución frente a fuera de distribución y el ratio de novedad resultante; por ejemplo, en TwoRoom el error del predictor sobre latentes con dimensiones barajadas es aproximadamente 114 veces su error sobre latentes reales.

El segundo tipo son sondas lineales de estado (`{env}_{quantity}_probe.pt`), entrenadas para decodificar el estado físico ground-truth (propiocepción o pose de objeto) directamente desde el embedding latente de LeWM, con el R² held-out reportado en el JSON correspondiente. En TwoRoom la posición del agente se decodifica con R² ≈ 0.99; en PushT el estado se decodifica con R² ≈ 0.73 de media entre dimensiones. No se documentan en la información disponible cifras de tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, ya que no aplican a este tipo de redes auxiliares. El código de construcción y consumo de cada red está en `exp_generality.py` (RND) y `eval_objective_variants.py` (sondas) del repositorio de código.

## Capacidades

- Estimación de novedad fuera de distribución mediante RND sobre latentes congelados de LeWM, con ratios de novedad calculados a partir del error de reconstrucción.
- Decodificación lineal de estado físico (propiocepción, pose de objeto) desde el embedding latente del world model.
- Actuación como baseline externo ("alguien plausiblemente habría propuesto esto") en el experimento de control de reemplazo del estudio.
- Soporte para auditar la calidad de la representación latente de un world model JEPA sin reentrenar el modelo base.
- Reproducción de los experimentos de generalidad asociados al análisis de colapso de resolución en planificadores CEM.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión directa, tool calling, function calling ni capacidades de agente multi-paso: no es un modelo de lenguaje ni un modelo multimodal.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, visión) en la información disponible.

## Casos de uso

- Auditoría de representaciones JEPA: entrenar sondas lineales sobre los latentes de LeWM para medir cuánta información de estado físico (posición, pose) conserva la representación congelada, usando el R² held-out como métrica objetiva de decodificabilidad.
- Detección de novedad fuera de distribución en entornos de control: emplear el predictor RND como detector de estados anómalos comparando el error de reconstrucción con el ratio de novedad registrado (por ejemplo, 113.8x con latentes barajadas en TwoRoom).
- Baseline de control en experimentos de generalidad: usar las redes RND como referencia externa frente a nuevas propuestas de estimadores de novedad, garantizando que la comparación se hace sobre el mismo espacio latente congelado.
- Diagnóstico de planificadores CEM basados en modelo: reproducir el fenómeno de colapso de resolución para verificar en qué fotograma el planificador pierde la señal de ordenación y contrastarlo con variantes corregidas.
- Selección y validación de checkpoints de world models: comparar distintas versiones o configuraciones de LeWM midiendo la decodificabilidad de estado con las sondas lineales como criterio de calidad representacional.
- Análisis de transferibilidad entre entornos: reutilizar el pipeline de sondas y RND en los cuatro entornos soportados (TwoRoom, PushT, Reacher, Cube) para estudiar qué propiedades del espacio latente se mantienen y cuáles dependen del dominio.
- Reproducibilidad de investigación: permitir a terceros replicar las métricas held-out publicadas en los JSON (R² = 0.993 en TwoRoom, R² = 0.732 en PushT) y contrastarlas con sus propias ejecuciones.

## Benchmarks y rendimiento

| Artefacto | Entorno | Rol | Metrica | Valor |
|---|---|---|---|---|
| `tworoom_rnd.pt` | TwoRoom | Novedad RND | Ratio de novedad con latentes barajadas por dimensión | 113.8x |
| `tworoom_rnd.pt` | TwoRoom | Novedad RND | Ratio de novedad con latentes escaladas | 9.5x |
| `pusht_rnd.pt` | PushT | Novedad RND | — | no disponible (ver `pusht_rnd.json`) |
| `reacher_rnd.pt` | Reacher | Novedad RND | — | no disponible (ver `reacher_rnd.json`) |
| `cube_rnd.pt` | Cube | Novedad RND | — | no disponible (ver `cube_rnd.json`) |
| `tworoom_proprio_probe.pt` | TwoRoom | Sonda de estado | R² held-out (posición del agente) | 0.993 |
| `pusht_state_probe.pt` | PushT | Sonda de estado | R² held-out (media entre dimensiones) | 0.732 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni métricas de rendimiento de planificación (retorno medio, tasa de éxito) para estas redes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un predictor RND y sondas lineales sobre latentes congelados, el consumo es mínimo y la inferencia es viable en CPU (`torch.load` con `map_location="cpu"`).
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU específico (A100, H100, RTX 4090 u otras).
- Cabe en GPU de consumo: no disponible como dato publicado, aunque por la naturaleza de las redes (predictor y sonda lineal) es esperable que quepa en cualquier GPU de consumo; el propio flujo de carga documentado funciona en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Alternativa | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lewm-resolution-collapse` (este repositorio) | Redes auxiliares sobre latentes JEPA congelados | no disponible | no aplica | MIT | HuggingFace, 0 descargas, 0 likes |
| LeWM (`quentinll/lewm-tworooms`, `-pusht`, `-reacher`, `-cube`) | World model JEPA base (dependencia congelada) | no disponible | no aplica | no disponible en esta ficha | HuggingFace (checkpoints oficiales) |
| RND e ICM clásicos | Estimadores de novedad intrínseca | no disponible | no aplica | no disponible | Implementaciones múltiples, sin checkpoint único de referencia |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación relevante para este repositorio es interna a los propios entornos (TwoRoom, PushT, Reacher, Cube), no frente a modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no produce texto, código ni respuestas conversacionales; cualquier uso en ese sentido es inadecuado.
- Los artefactos están acoplados al espacio latente congelado de LeWM; si se cambia el world model base o su versión, las sondas y predictores RND dejan de ser válidos y deben reentrenarse.
- Cobertura limitada a cuatro entornos de control (TwoRoom, PushT, Reacher, Cube); no hay evidencia de generalización a otros dominios.
- Las sondas son lineales, por lo que su R² mide decodificabilidad lineal, no la información total contenida en el latente; el rendimiento varía notablemente por entorno (R² = 0.993 en TwoRoom frente a R² = 0.732 en PushT).
- Solo se publican métricas completas para parte de los artefactos: los valores de PushT, Reacher y Cube remiten a los JSON, no incluidos en la información disponible.
- El tamano del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que se trata de punteros; conviene verificar la descarga real antes de depender de ellos.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni resultados de terceros que respalden las métricas.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el predictor RND puede producir ratios de novedad poco informativos si los latentes de entrada se alejan de la distribución de entrenamiento de formas no contempladas.
- Licencia MIT, compatible con uso comercial y con la licencia del repositorio LeWM base, pero el uso comercial de estos artefactos carece de valor sin el world model subyacente y su propio marco licencial, que no se detalla aquí.
- Fecha de creación y actualización registradas como 2026-10-03; conviene confirmar la vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/TingheOliver/lewm-resolution-collapse
- Repositorio de código del estudio: https://github.com/OliverZ-dot/lewm-resolution-collapse
- Repositorio base de LeWM: https://github.com/lucas-maes/le-wm
- Checkpoints oficiales de LeWM en HuggingFace: `quentinll/lewm-tworooms`, `quentinll/lewm-pusht`, `quentinll/lewm-reacher`, `quentinll/lewm-cube`
