# xgirls/longcat-image-openvino-int8

## Resumen

LongCat-Image OpenVINO INT8 es una redistribucion cuantizada del modelo de generacion de imagenes LongCat-Image de Meituan, publicada por el usuario xgirls. Se trata de un build del transformer de 6.270 millones de parametros exportado a OpenVINO y cuantizado a INT8 con NNCF 3.4.0, manteniendo el codificador de texto Qwen2.5-VL en BF16 y el VAE en sus pesos originales. El objetivo es ejecutar el transformer de difusion en CPU mediante OpenVINO, sin necesidad de GPU para ese componente.

El repositorio no contiene un modelo nuevo ni un reentrenamiento: es una conversion de formato y precision sobre el checkpoint original `meituan-longcat/LongCat-Image`, con licencia Apache-2.0 heredada. El transformer comprimido ocupa 6,28 GB frente a los 12,54 GB de la exportacion FP32 a OpenVINO, aproximadamente la mitad. No incluye los checkpoints de edicion de imagen ni el modulo de reescritura de prompt del modelo original.

Su relevancia es acotada pero concreta: permite desplegar generacion texto-a-imagen de 6.270 millones de parametros en entornos sin GPU (servidores de CPU, hardware on-premise, estaciones sin acelerador), a costa de un coste de inferencia muy alto. El autor reporta 7 minutos y 16 segundos para una imagen de 1024x1024 con 8 pasos en un host de 30 vCPU, usando CUDA para el codificador de texto y el VAE. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (text-to-image) segun la model card; sin mas detalle publicado |
| Parametros totales | 6.270 millones (transformer); total del pipeline no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; no aplica ventana de contexto de texto (modelo de imagen, prompt codificado con Qwen2.5-VL) |
| Tipos de cuantizacion | INT8 simetrico por canal de solo pesos (`INT8_SYM`) en el transformer; BF16 nativo en codificador de texto y VAE |
| Idiomas soportados | en, zh (segun etiquetas del repositorio) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | OpenVINO IR (transformer cuantizado) + safetensors (codificador de texto y VAE) + `quantization_config.json` |
| Tamano del repositorio | 23,0 GB |
| Tamano del transformer comprimido | 6,28 GB (frente a 12,54 GB de la exportacion FP32 a OpenVINO) |
| Pipeline | text-to-image (Diffusers) |
| Modelo base | meituan-longcat/LongCat-Image |
| Fecha de publicacion | 2026-10-16 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card describe el componente principal como un transformer de 6.270 millones de parametros para generacion texto-a-imagen, integrado en un pipeline de Diffusers junto a un codificador de texto Qwen2.5-VL en BF16 y un VAE. El autor no detalla el tipo de bloque de atencion ni la composicion interna del transformer, por lo que la informacion arquitectonica mas alla de esa descripcion no esta disponible en los materiales proporcionados. La exportacion a OpenVINO mantiene dimensiones dinamicas tanto para la secuencia de texto como para la imagen.

No hay entrenamiento adicional ni ajuste fino: la cuantizacion se realizo con NNCF 3.4.0 aplicando INT8 simetrico por canal a todos los pesos del transformer, con solo pesos cuantizados (weight-only). El proceso esta documentado en `quantization_config.json`. Los componentes nativos (Qwen2.5-VL y VAE) se conservan en safetensors BF16 y se ejecutan con PyTorch. La model card indica explicitamente que no se incluyen los checkpoints de edicion de imagen ni la funcionalidad de reescritura de prompt, por lo que el prompt del usuario llega directamente al codificador de texto sin preprocesado.

## Capacidades

- Generacion de imagenes a partir de texto en resoluciones cuyo lado sea multiplo de 16; la validacion publicada usa 1024x1024 con 8 pasos y guidance scale 4.0.
- Ejecucion del transformer en CPU mediante OpenVINO, con el codificador de texto y el VAE en CUDA (BF16) o en CPU (mas lento, segun el autor no evaluado).
- Renderizado de texto dentro de la imagen: la muestra de validacion conserva la etiqueta manuscrita solicitada ("MONSTERA").
- Prompts en ingles y chino, segun los idiomas declarados.
- Ejecucion a traves del pipeline de Diffusers con el script `infer.py` incluido.
- Sin soporte de reescritura de prompt: esa funcionalidad del modelo original no esta incluida en este repositorio.
- Sin soporte de edicion de imagen: los checkpoints de edicion no se distribuyen aqui.
- Sin tool calling, agentes ni razonamiento multi-paso: es un modelo de generacion de imagenes, no un modelo de lenguaje conversacional.

## Casos de uso

- Generacion de imagenes en servidores sin GPU: el transformer corre en CPU via OpenVINO, de modo que un host sin acelerador puede producir imagenes de 1024x1024 aceptando tiempos de minutos por imagen, util para entornos con restricciones de hardware.
- Procesamiento por lotes no interactivo: al no requerir GPU para el transformer, se puede programar la generacion de catalogos o ilustraciones en horas valle sobre infraestructura de CPU ya amortizada.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse localmente y sin llamadas a APIs externas, encaja en flujos donde los prompts no pueden salir de la organizacion.
- Prototipado y evaluacion de calidad de cuantizacion: sirve para comparar visualmente la salida INT8 frente a la referencia BF16 del modelo base antes de decidir una precision de produccion.
- Generacion de material grafico con texto integrado: la validacion publicada muestra que el modelo mantiene una etiqueta escrita en la imagen, aprovechable para mockups, carteles o packaging con rotulacion sencilla.
- Ilustracion para contenidos en ingles y chino: el modelo declara soporte para ambos idiomas, adecuado para equipos que generan imagenes para publicos de esos mercados.
- Banco de pruebas de pipelines OpenVINO: como ejemplo funcional de exportacion de un transformer de difusion a OpenVINO IR con dimensiones dinamicas y cuantizacion NNCF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta una validacion visual de una sola muestra, sin metrica cuantitativa de calidad (FID, CLIP score u otras).

| Medicion | Valor | Condiciones |
|---|---|---|
| Tiempo de generacion (build INT8 OpenVINO) | 7 min 16 s | 1024x1024, 8 pasos, guidance 4,0, seed 42; transformer en CPU OpenVINO sobre host de 30 vCPU, codificador de texto y VAE en CUDA BF16 |
| Tiempo de generacion (referencia BF16) | 5,2 s | Mismo prompt; ruta de hardware distinta (CUDA), el autor advierte que no es una comparacion equivalente |
| Compresion del transformer | 6,28 GB frente a 12,54 GB FP32 OpenVINO | Cuantizacion INT8 simetrica por canal con NNCF 3.4.0 |
| Calidad | Sin metrica | Comprobacion visual de una sola muestra (composicion y texto de la etiqueta conservados) |

## Requisitos de hardware

- VRAM para el transformer: no aplica en la ruta probada, ya que el transformer se ejecuta en CPU via OpenVINO. En la ruta nativa BF16, el checkpoint del transformer ronda los 12,54 GB en FP32 segun el autor (la cifra BF16 no se especifica).
- Memoria para el resto del pipeline: el codificador de texto Qwen2.5-VL y el VAE se ejecutan en BF16 con PyTorch; su huella concreta no esta indicada en la model card. El repositorio completo ocupa 23,0 GB en disco.
- CPU: el host de validacion es una instancia Lambda de 30 vCPU. No se publican requisitos minimos de nucleos ni de RAM; el autor senala que la ejecucion 100% en CPU no ha sido evaluada ("slower and has not been benchmarked here").
- GPU recomendadas: no disponibles. La unica ruta con GPU descrita usa CUDA para el codificador de texto y el VAE, sin especificar modelo de tarjeta. Si cabe o no en GPU de consumo no esta documentado para esta build.
- Despliegue: runtime de OpenVINO para el transformer, PyTorch con TorchVision para los componentes nativos y el pipeline de Diffusers, orquestado por el script `infer.py`. Se indica Python 3.11 y un `requirements.txt` con versiones fijadas. No aplica vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: 7 min 16 s por imagen de 1024x1024 a 8 pasos en el host de 30 vCPU citado. No hay datos de throughput por lote ni de latencia en otras configuraciones.
- Restriccion de forma: las dimensiones de imagen deben ser multiplas de 16.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar esta build con su modelo base. No hay datos de benchmarks ni de rendimiento de alternativas en los materiales disponibles.

| Modelo | Parametros | Contexto / resolucion | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xgirls/longcat-image-openvino-int8 | 6,27B (transformer) | Multiplos de 16; validado a 1024x1024 | Transformer INT8, resto BF16 | Apache-2.0 | HuggingFace, 0 descargas |
| meituan-longcat/LongCat-Image | 6,27B (transformer) | No disponible en esta informacion | BF16 nativo | Apache-2.0 | HuggingFace (modelo base) |
| Otras alternativas texto-a-imagen de tamano comparable (por ejemplo FLUX.1-dev, Stable Diffusion 3.5) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables para comparar rendimiento, calidad o licencia frente a modelos de la misma categoria distintos del modelo base.

## Limitaciones y advertencias

- Rendimiento muy bajo en CPU: 7 minutos y 16 segundos por imagen de 1024x1024 a 8 pasos en un host de 30 vCPU. No es apto para aplicaciones interactivas en esa configuracion.
- La comparacion de velocidad frente a la referencia BF16 (5,2 s) corresponde a una ruta de hardware distinta y el propio autor advierte que no es equivalente.
- Validacion de calidad insuficiente: una sola muestra visual, sin metricas objetivas. No hay evidencia publicada sobre degradacion introducida por la cuantizacion INT8.
- Funcionalidad recortada respecto al modelo base: no incluye los checkpoints de edicion de imagen ni la reescritura de prompt.
- Idiomas limitados a ingles y chino segun las etiquetas; el comportamiento con prompts en castellano u otras lenguas no esta documentado, por lo que la calidad en esos idiomas es incierta.
- Riesgo de alucinacion visual: como cualquier modelo generativo texto-a-imagen, puede producir texto ilegible, anatomia incorrecta o detalles incoherentes con el prompt, especialmente sin la reescritura de prompt del modelo original.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, culturales o de representacion en esta build ni en el modelo base dentro de los materiales disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el repositorio es una redistribucion de terceros; conviene verificar el archivo `LICENSE` y el estado del modelo base antes de integrarlo en produccion.
- Ausencia de adopcion: 0 descargas y 0 likes. No hay senales de uso en produccion ni mantenimiento continuado por parte del autor.
- Dependencias fijadas (Python 3.11, NNCF 3.4.0) que pueden complicar la integracion en entornos con versiones distintas.
- Solo se distribuyen los componentes del checkpoint de texto-a-imagen necesarios para el runner, no el modelo completo.
- La fecha de publicacion registrada en HuggingFace es 2026-10-16 segun los metadatos; conviene verificarla directamente en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xgirls/longcat-image-openvino-int8
- Modelo base: https://huggingface.co/meituan-longcat/LongCat-Image
- Diffusers (libreria del pipeline): https://github.com/huggingface/diffusers
- OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (cuantizacion): https://github.com/openvinotoolkit/nncf
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las coincidencias devueltas corresponden a foros de consumo sin relacion con el proyecto.
