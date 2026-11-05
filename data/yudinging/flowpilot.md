# YuDinging/FlowPilot

## Resumen

FlowPilot es un modelo de tipo world-action model basado en flow matching, desarrollado por YuDinging y publicado en HuggingFace, orientado a la navegación autónoma de UAV (drones) en tiempo real a bordo. El modelo combina la modelización conjunta de latentes de vídeo y tokens de acción mediante una arquitectura dual-stream MoT (Mixture of Transformers), lo que le permite generar trayectorias de vuelo a partir de observaciones visuales y estados de la aeronave.

La salida de acciones se parametriza mediante un polinomio de Bernstein de séptimo orden con 8 puntos de control (3 fijados por el estado inicial y 5 predichos por la red), produciendo 48 waypoints a 30 Hz. Esto convierte al modelo en un generador de trayectorias suaves y físicamente plausibles, adecuado para control de vuelo en bucle cerrado. La liberación incluye únicamente los checkpoints de la fase 2 de entrenamiento; los pesos del VAE de Wan2.2 deben descargarse por separado desde el repositorio oficial de Wan-AI.

El modelo es relevante en el contexto actual de modelos fundacionales para robótica, donde se busca sustituir pipelines modulares de percepción-planificación-control por políticas únicas entrenadas con datos de simulación (Flightmare) y evaluadas en inferencia a bordo. Su licencia Apache-2.0 facilita la experimentación académica y comercial, aunque el autor advierte explícitamente que no está certificado para vuelo crítico en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-stream MoT (Mixture of Transformers) con flow matching; world-action model |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`); checkpoint de inferencia en `ckpt/phase2/ckpt_final.pt` (651 MB) |
| Parametrizacion de acciones | Polinomio de Bernstein de 7.º orden, 8 puntos de control (3 fijos + 5 predichos) |
| Salida de trayectoria | 48 waypoints a 30 Hz |
| VAE asociado | Wan2.2 VAE (descarga externa, `Wan2.2_VAE.pth`) |
| Entorno de simulacion | Flightmare |
| Tamano del repo | 3.5 GB |

## Arquitectura y entrenamiento

FlowPilot emplea una arquitectura dual-stream MoT que procesa en paralelo dos modalidades: latentes de vídeo (codificados mediante el VAE de Wan2.2) y tokens de acción. El modelo se entrena con flow matching, una formulación de modelos generativos basada en campos de velocidad que aprende una transformación continua entre distribuciones, en lugar de la difusión clásica. Esta elección permite generar trayectorias de acción suaves y continuas, lo que encaja con la parametrización polinómica de Bernstein utilizada para representar la trayectoria de vuelo.

La parametrización de acciones fija 3 de los 8 puntos de control de Bernstein al estado inicial de la aeronave y predice los 5 restantes, garantizando continuidad con la condición de arranque y produciendo 48 waypoints a 30 Hz. El entrenamiento se realizó en dos fases (el checkpoint liberado es el de la fase 2) y se apoya en el simulador Flightmare para generar datos de navegación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). Los archivos `action_stats.pt` y `coeff_stats.pt` contienen las estadísticas de normalización de acciones, estados y coeficientes de Bernstein necesarias para la inferencia.

## Capacidades

- Navegación autónoma de UAV en tiempo real a bordo, generando trayectorias de vuelo a partir de observaciones visuales y estado de la aeronave.
- Modelización conjunta de latentes de vídeo y tokens de acción (world-action model), lo que permite anticipar la evolución visual del entorno junto con la acción.
- Generación de trayectorias suaves mediante polinomios de Bernstein de séptimo orden con 5 puntos de control predichos.
- Producción de 48 waypoints a 30 Hz, adecuada para control en bucle cerrado de drones.
- Inferencia en simulación mediante Flightmare y despliegue en contenedor Docker provisto en el repositorio de código.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking; el modelo está especializado exclusivamente en navegación de UAV.

## Casos de uso

- Investigación en navegación basada en aprendizaje: el modelo sirve como política de referencia para experimentos de navegación autónoma en simulador Flightmare, permitiendo comparar variantes de flow matching frente a políticas clásicas de planificación.
- Evaluación de world-action models: al modelar conjuntamente latentes de vídeo y acciones, permite estudiar la coherencia entre la predicción visual del entorno y la trayectoria generada, un aspecto clave en la literatura de modelos fundacionales para robótica.
- Generación de trayectorias suaves para control de vuelo: la parametrización con polinomios de Bernstein y 48 waypoints a 30 Hz produce comandos continuos y derivables, adecuados para controladores de vuelo que requieren suavidad en las consignas.
- Inferencia a bordo en plataformas con recursos limitados: el checkpoint de 651 MB y el uso de un VAE externo permiten experimentar con despliegue en hardware embebido de drones, siempre en entorno de laboratorio.
- Benchmarking de simulación a realidad: el pipeline Docker del repositorio de código facilita reproducir experimentos en Flightmare y evaluar la brecha sim-to-real antes de trasladar políticas a plataformas físicas.
- Docencia y formación en robótica aérea: el modelo y su código asociado constituyen un ejemplo completo de pipeline de entrenamiento e inferencia de un world-action model para UAV, útil en cursos de aprendizaje profundo aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de inferencia ocupa 651 MB en FP32, por lo que en FP16 rondaría los 325 MB solo para los pesos del modelo, a lo que hay que sumar el VAE de Wan2.2 (tamano no especificado en la informacion disponible) y las activaciones.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, es plausible que quepa en GPUs de consumo, pero no se confirma en la documentacion.
- Cabe en consumer GPU: no confirmado; el tamano de pesos sugiere que si, pero la memoria total depende del VAE y del runtime.
- Opciones de despliegue: el repositorio de codigo proporciona un flujo basado en Docker (`python docker/docker.py build` y `python docker/docker.py start`) y simulacion en Flightmare. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La salida esta disenada para 30 Hz (48 waypoints), lo que sugiere un requisito de inferencia en tiempo real, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlowPilot | World-action model para UAV (flow matching, MoT) | no disponible | no disponible | Apache-2.0 | Checkpoints en HuggingFace + codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor indica explicitamente que los pesos se liberan para investigacion en navegacion de UAV basada en aprendizaje y que no estan certificados para vuelo critico en seguridad. No deben usarse en operaciones reales sin validacion adicional.
- El modelo esta especializado en navegacion de UAV; no es un modelo de lenguaje ni un modelo multimodal general, por lo que no debe evaluarse con benchmarks de texto, codigo o razonamiento.
- Los pesos del VAE de Wan2.2 no se incluyen en el repositorio y deben descargarse por separado; una descarga incorrecta o una version distinta del VAE puede romper la reproducibilidad.
- El checkpoint liberado es el de la fase 2 e incluye estado del optimizador y del scheduler, lo que aumenta el tamano del archivo y requiere extraer el state dict bajo la clave `model` para inferencia.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma, ya que el modelo no procesa lenguaje. El riesgo principal es la generalizacion limitada del simulador Flightmare al mundo real (brecha sim-to-real), no cuantificada en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de certificacion de seguridad y de benchmarks publicados desaconseja su uso en produccion sin evaluacion propia.
- No se especifican requisitos minimos de hardware ni latencias medidas, lo que dificulta planificar despliegues a bordo.

## Enlaces

- HuggingFace: https://huggingface.co/YuDinging/FlowPilot
- Repositorio de codigo: https://github.com/flyingbitac/FlowPilot
- VAE Wan2.2 (descarga externa): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
