# usctigerw/depth-anything-v2-small-tidl-j721e

## Resumen

Este repositorio contiene una versión optimizada para despliegue en hardware de borde del modelo Depth Anything V2 Small. Se trata de un artefacto ONNX estático acompañado de artefactos TIDL de 16 bits generados específicamente para la plataforma SK-TDA4VM / J721E de Texas Instruments, empleando TIDL 11_00_08_00 y el SDK 11.00.00.08. El autor es el usuario de HuggingFace usctigerw y el modelo base es depth-anything/Depth-Anything-V2-Small-hf, cuyos pesos entrenados originales se preservan.

El problema que resuelve es la estimación de profundidad relativa (profundidad inversa relativa) directamente en el acelerador C7x/MMA de un SoC TDA4VM, sin depender de una GPU. El modelo recibe una entrada float32 `pixel_values` de forma 1 × 3 × 224 × 392 y produce `predicted_depth` de forma 1 × 224 × 392. La relevancia radica en que permite ejecutar inferencia de profundidad densa en placas de bajo consumo orientadas a automoción y robótica, aunque el soporte completo en placa no está verificado por el autor.

No se dispone de información sobre el número de parámetros, el contexto (no aplica a un modelo de visión) ni los idiomas, ya que se trata de un modelo de estimación de profundidad monocular y no de un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivada de Depth Anything V2 Small) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | Artefactos TIDL de 16 bits (16-bit TIDL artifacts) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX estatico y artefactos TIDL (repo de 0.2 GB, libreria onnx) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del checkpoint (tipo de encoder, cabecera de profundidad o composición del dataset de entrenamiento). El modelo deriva de Depth Anything V2 Small de Lihe Yang y colaboradores, cuyos pesos entrenados se conservan sin modificar en la conversión a ONNX y TIDL. No se documentan en este repositorio datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO, ya que no es un modelo generativo de lenguaje.

La innovación técnica destacable es el proceso de conversión y reparación del grafo para que el compilador TIDL lo asigne al acelerador C7x/MMA. El autor documenta cuatro reparaciones: mover una transposición a través del patrón de LayerNorm dividido para que el importador de TI reconozca la normalización; dividir los canales Q/K/V antes de la reforma de rango cinco para evitar fallos de `Gather` escalar; mantener el `Softmax` en CPU y desactivar el recorte de activaciones y pesos y la calibración de sesgos para preservar la salida de atención; y sustituir cinco operaciones `Resize` bilineales con alineación de esquinas por interpolación separable exacta expresada como operaciones `MatMul` constantes para la MMA. Esta última sustitución redujo el RMSE relativo de 10,59 % a 0,006 %. La transformación del grafo alteró la salida de CPU en un máximo de 0,0000692 sobre tres entradas de calibración.

## Capacidades

- Estimación de profundidad relativa inversa monocular a partir de una imagen RGB, con salida `predicted_depth` de forma 1 × 224 × 392.
- Entrada en formato float32 NCHW de 1 × 3 × 224 × 392, con preprocesado documentado: redimensionado bicúbico con Pillow a 392 × 224, división por 255 y normalización con media `[0.485,0.456,0.406]` y desviación `[0.229,0.224,0.225]`.
- Ejecución particionada en el acelerador C7x/MMA de J721E con 804 de 817 nodos ONNX asignados a TIDL, distribuidos en 14 subgrafos.
- Doce nodos `Softmax` y una `ConvTranspose` se ejecutan en CPU de forma explícita, sin fallback silencioso de modelo completo.
- Procesamiento de vídeo completo: el runner decodifica, infiere y codifica hasta el final del fichero, con opción de muestreo a una tasa de fotogramas concreta (por ejemplo, `--fps 2`).
- Soporte de entrada de cámara en vivo en el destino mediante el argumento `--camera` (por ejemplo, `/dev/video2`), aunque el runner secuencial actual es una referencia de corrección, no un pipeline de baja latencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento, por tratarse de un modelo específico de profundidad.

## Casos de uso

- Fusión con LiDAR: la profundidad densa alineada con la imagen puede complementar las mediciones directas de rango de un LiDAR, aportando detalle de escena alineado con la cámara. Requiere calibración cámara/LiDAR, alineación temporal, alineación de escala y gestión de incertidumbre.
- ADAS y percepción automotriz: la profundidad calibrada junto con seguimiento permite posicionar obstáculos, estimar distancias de seguimiento, calcular riesgo de colisión y planificar espacio libre, aunque la profundidad relativa por sí sola no permite establecer distancia de frenado ni tiempo hasta la colisión.
- Robótica móvil: la profundidad métrica (previa calibración) soporta evitación de obstáculos, mapeo 3D, planificación de alcance y geometría de agarre. El modelo aporta estructura de escena, pero el control del robot requiere geometría calibrada y validación temporal.
- Percepción embarcada de bajo consumo: al ejecutarse sobre el SoC TDA4VM con el acelerador C7x/MMA, es adecuado para sistemas con restricciones estrictas de energía y sin GPU dedicada.
- Preprocesado de vídeo en borde: procesamiento por lotes de fotogramas de vídeo para generar mapas de profundidad que alimenten etapas posteriores de segmentación, detección o reconstrucción.
- Investigación y prototipado en plataformas TI: sirve como referencia de conversión de un modelo de profundidad a TIDL, incluyendo las reparaciones de grafo documentadas que pueden reutilizarse para otros modelos con patrones de atención similares.
- Demostración y validación de pipelines ONNX/TIDL: útil para verificar el flujo completo de importación, calibración y ejecución particionada en emulación de host antes de compilar para el SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. El autor sí publica una tabla de validación orientada a la fidelidad de la conversión:

| Propiedad | Resultado |
|---|---|
| Ejecución demostrada | Emulación de host x86 con TI ONNX Runtime |
| Entrada del modelo | float32 `pixel_values`, 1 × 3 × 224 × 392 |
| Salida del modelo | `predicted_depth`, 1 × 224 × 392, profundidad inversa relativa |
| Cobertura TIDL | 804/817 nodos ONNX, 14 subgrafos (la fracción de nodos no equivale a cobertura de MACs) |
| Operaciones en CPU | 12 nodos Softmax y una ConvTranspose |
| Validación en vídeo | 19/19 fotogramas superados |
| Peor RMSE relativo crudo frente a CPU en el vídeo | 1,46 % |
| RMSE del primer fotograma de calibración frente a CPU | 0,89 % |
| Reproducción | 19 fotogramas muestreados a 2 FPS, 9,5 segundos; no es un throughput de inferencia medido |
| Ejecución en placa / FPS objetivo | No verificado |

Se emplearon tres fotogramas de calibración. El autor advierte que estas comprobaciones no establecen generalización ni precisión de profundidad física, y que los tensores crudos se compararon sin reescalar las predicciones.

## Requisitos de hardware

- Plataforma objetivo: SK-TDA4VM / J721E (SoC TDA4VM con acelerador C7x/MMA). Los artefactos están compilados para esta combinación de SDK y SoC; otros destinos requieren recompilación.
- Entorno de herramientas: TIDL 11_00_08_00 y SDK 11.00.00.08, con las librerías de runtime ONNX Runtime/TIDL de TI obtenidas por separado (las librerías y herramientas propietarias de TI no se incluyen).
- Variables de entorno en J721E: `SOC=am68pa`, `TIDL_TOOLS_PATH` y `LD_LIBRARY_PATH` apuntando a las herramientas de TI instaladas.
- VRAM: no aplica; el modelo se ejecuta sobre el acelerador C7x/MMA y CPU del SoC, no sobre GPU.
- GPU recomendadas: no aplica (no es un despliegue orientado a GPU).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: TI ONNX Runtime con TIDL (ejecución en emulación de host x86 o en el SoC), con particionado explícito de operaciones en CPU; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no verificados en placa. La reproducción del vídeo de demostración (19 fotogramas a 2 FPS, 9,5 segundos) no mide throughput de inferencia. El runner secuencial actual es una referencia de corrección y se requiere un pipeline de cámara de baja latencia para un despliegue en tiempo real.
- Tamaño del repositorio: 0,2 GB.

## Comparativa con modelos similares

La información disponible solo permite comparar este artefacto con su modelo base. No se proporcionan datos de otros modelos comparables.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| usctigerw/depth-anything-v2-small-tidl-j721e | No disponible | No aplica | ONNX + artefactos TIDL 16 bits | Apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| depth-anything/Depth-Anything-V2-Small-hf | No disponible en la informacion | No aplica | safetensors (PyTorch) | Apache-2.0 | HuggingFace |

Diferencias clave: ambas versiones conservan los mismos pesos entrenados. Este artefacto añade el grafo ONNX estático modificado y los artefactos TIDL para J721E, orientados a ejecución en el acelerador C7x/MMA, mientras que el modelo base está pensado para inferencia en PyTorch sobre CPU/GPU convencional. Para otros modelos comparables (por ejemplo, variantes de mayor tamaño de Depth Anything V2 u otras familias de estimación de profundidad monocular), no hay datos disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo predice profundidad inversa relativa, no metros. No es un sensor ToF y no proporciona profundidad métrica calibrada por sí solo.
- La ejecución en placa y el FPS objetivo no están verificados; toda la validación presentada corresponde a emulación de host x86 con TI ONNX Runtime.
- CPU agreement mide la preservación de la salida del modelo, no la precisión frente a una verdad de referencia física.
- Las comprobaciones se realizaron con tres fotogramas de calibración y no establecen generalización ni precisión de profundidad física.
- El vídeo de demostración usa predicciones independientes y escalado de color por fotograma; los cambios de color no deben interpretarse como movimiento ni distancia medidos.
- El runner secuencial actual es una referencia de corrección; para despliegue en tiempo real se necesita un pipeline de cámara de baja latencia y mediciones en el destino.
- Los artefactos están ligados a la combinación SDK/SoC (J721E con TIDL 11_00_08_00 y SDK 11.00.00.08); otros destinos requieren recompilación.
- No se incluyen las librerías ni herramientas propietarias de TI, que deben obtenerse por separado.
- El fallback silencioso a CPU de modelo completo está desactivado; las operaciones en CPU están particionadas explícitamente, lo que puede afectar al rendimiento si esas operaciones resultan costosas.
- Para uso comercial, la licencia Apache-2.0 se aplica al artefacto del autor, pero el uso de las marcas y herramientas de TI está sujeto a sus propias condiciones; las marcas de TI identifican el tooling objetivo y no implican respaldo.
- Sesgos conocidos del modelo base (en composición del dataset de entrenamiento y dominios visuales cubiertos): no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la profundidad estimada puede ser incorrecta en dominios fuera de la distribución de entrenamiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usctigerw/depth-anything-v2-small-tidl-j721e
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Space de demostración: https://huggingface.co/spaces/usctigerw/depth-anything-tidl-demo
- Pull request upstream de TI (edgeai-tidl-tools PR #113): https://github.com/TexasInstruments/edgeai-tidl-tools/pull/113
- Referencia de mapeo profundidad/LiDAR de Isaac ROS: https://nvidia-isaac-ros.github.io/repositories_and_packages/isaac_ros_nvblox/index.html
- Informe de seguridad de conducción autónoma de NVIDIA: https://docs.nvidia.com/self-driving-cars/autonomous-driving-safety-report/index.html
- Vídeo de demostración (MP4): demo/demo.mp4 (en el repositorio)
