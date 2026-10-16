# xgirls/ernie-image-turbo-openvino-int4-awq

## Resumen

ERNIE-Image-Turbo OpenVINO INT4 AWQ es una conversion cuantizada del transformer de 8B del modelo de generacion de imagenes baidu/ERNIE-Image-Turbo, publicada por el usuario xgirls. El trabajo no reentrena ni modifica la arquitectura: aplica cuantizacion weight-only sobre los pesos del transformer para ejecutarlo con OpenVINO, manteniendo intactos el text encoder Mistral3 en BF16 y el VAE Flux2 del checkpoint original de Diffusers.

El problema que resuelve es el coste de despliegue. Frente a una representacion IR en FP32 de 30,0 GB, el transformer cuantizado ocupa 4,65 GB, lo que permite ejecutar la parte mas pesada del pipeline en CPU con OpenVINO mientras el text encoder y el VAE se ejecutan en una GPU NVIDIA mediante CUDA. Es relevante para equipos que necesitan generar imagenes en infraestructura sin GPU o con GPU limitada, a cambio de una latencia muy superior.

Se trata de un artefacto de nicho, orientado a la libreria diffusers y al ecosistema OpenVINO/NNCF, con licencia Apache-2.0 heredada del modelo base. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se han publicado resultados de benchmarks objetivos, por lo que su validacion se limita a una unica muestra generada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (ERNIE-Image-Turbo, 8B) con text encoder Mistral3 en BF16 y VAE Flux2; transformer convertido a OpenVINO |
| Parametros totales | 8B en el transformer; el recuento de parametros del text encoder y del VAE no esta disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no documentada para el text encoder Mistral3) |
| Tipos de cuantizacion | INT4_SYM con group-size 64, ratio 0,9 y AWQ sobre el transformer; 10% de los parametros que definen el ratio usan backup INT8_SYM per-channel; text encoder y VAE permanecen en BF16 |
| Idiomas soportados | no disponible (el unico ejemplo documentado usa un prompt en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (text encoder y VAE, BF16) y OpenVINO IR (transformer cuantizado) |
| Tamano del transformer cuantizado | 4,65 GB (frente a 30,0 GB del IR FP32 sin comprimir) |
| Tamano del repositorio | 12,5 GB |
| Resolucion validada | 1024x1024; la resolucion es dinamica pero debe ser divisible por 16 |
| Pasos y guia validados | 8 pasos, guidance 1, seed 42 |
| Pipeline | text-to-image |
| Libreria | diffusers |
| Fecha de publicacion | 16 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion de 8B parametros para generacion de imagenes a partir de texto, acompanado de un text encoder Mistral3 en BF16 y un VAE Flux2. Esta ficha describe exclusivamente el proceso de cuantizacion, no un entrenamiento nuevo: no hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que esa informacion pertenece a la model card del modelo original y no se incluye en el material disponible.

La innovacion tecnica del repositorio es el recipe de compresion. Se aplico NNCF 3.4.0 con compresion INT4_SYM, group-size 64 y ratio 0,9 junto con AWQ sobre ocho llamadas capturadas del transformer; el 10% restante de los parametros que definen el ratio se conserva con un backup INT8_SYM per-channel para limitar la degradacion. El resultado es una representacion OpenVINO de 4,65 GB que admite dimensiones de imagen y de texto dinamicas, con la restriccion de que el lado de la imagen sea divisible por 16. El prompt enhancer opcional del modelo original se omite deliberadamente: los prompts se envian directamente al text encoder nativo y el parametro `use_pe` queda deshabilitado.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, con soporte de resoluciones dinamicas divisibles por 16 (validado a 1024x1024).
- Renderizado de texto dentro de la imagen: la muestra publicada reproduce literalmente los rotulos solicitados ("CEDAR & BEAN", "OPEN DAILY", "7 AM - 8 PM"), lo que apunta a capacidad de tipografia y carteleria.
- Composicion de escenas guiada por descripcion detallada, incluidos objetos, materiales y disposicion (taza de ceramica junto a granos de cafe en el ejemplo).
- Generacion rapida con pocos pasos: la validacion usa 8 pasos con guidance 1.
- Ejecucion del transformer en CPU mediante OpenVINO, con el text encoder y el VAE en GPU NVIDIA a traves de `--torch-device cuda`.
- Control de reproducibilidad mediante semilla (`--seed 42` en el ejemplo).
- No incluye el prompt enhancer del modelo original, por lo que no hay reescritura automatica de prompts.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo generativo de imagenes.
- Capacidades multilingues: no disponibles ni documentadas.

## Casos de uso

- Carteleria y material promocional con texto: el modelo esta validado generando un poster de cafeteria con tipografia legible y rotulos exactos a 1024x1024 en 8 pasos, por lo que encaja en la produccion de posters, flyers y banners donde el texto integrado es requisito.
- Despliegue en infraestructura sin GPU dedicada: al ejecutar el transformer con OpenVINO en CPU, permite ofrecer generacion de imagenes en servidores on-premise o entornos air-gapped donde no hay acelerador NVIDIA disponible.
- Generacion por lotes fuera de horario punta: con 368,6-402 segundos por imagen en un host de 30 vCPU, resulta adecuado para colas batch nocturnas o pipelines asincronos donde la latencia no es critica.
- Prototipado visual de concepto: generar variaciones rapidas de una idea de diseno consumiendo solo 4,65 GB de pesos del transformer, util en equipos que iteran conceptos antes de pasar a un modelo mayor.
- Sintesis de imagenes con texto para datasets: la capacidad de reproducir cadenas exactas permite crear datos sinteticos orientados a entrenar o evaluar modelos de OCR y deteccion de texto en escenas.
- Ilustracion de documentacion y articulos tecnicos: generacion de figuras y cabeceras bajo peticion en pipelines de publicacion internos, con control por semilla para mantener coherencia entre revisiones.
- Demostraciones y entornos educativos: su tamano reducido del transformer (4,65 GB) y el uso de OpenVINO facilitan montar demos de generacion de imagenes en portatiles o maquinas de laboratorio sin GPU de gama alta.
- Mockups de producto: a partir de una descripcion textual se pueden obtener composiciones de producto con etiquetado, utiles en validacion temprana de packaging antes de encargar renders profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de FID, CLIP score, ImageReward ni de calidad de texto renderizado. Los unicos datos de rendimiento disponibles son mediciones de latencia del propio autor:

| Medicion | Configuracion | Resultado |
|---|---|---|
| Inferencia end-to-end | Transformer OpenVINO en CPU (30 vCPU Lambda) + text encoder y VAE BF16 en CUDA, 1024x1024, 8 pasos, guidance 1, seed 42 | 368,6-402 segundos en dos ejecuciones |
| Referencia BF16 | Ruta CUDA completa en el mismo host | 27,4 segundos |
| Tamano de pesos | Transformer cuantizado INT4 frente a IR FP32 sin comprimir | 4,65 GB frente a 30,0 GB |

El autor advierte explicitamente que la comparacion 368,6-402 s frente a 27,4 s es una comparacion entre rutas de hardware distintas (OpenVINO en CPU frente a CUDA nativo) y no una afirmacion de velocidad equivalente.

## Requisitos de hardware

- Transformer cuantizado: 4,65 GB de pesos en formato OpenVINO IR; esta pensado para ejecutarse en CPU y su consumo de memoria no se detalla.
- Text encoder Mistral3 y VAE: deben permanecer en BF16 y el autor recomienda ejecutarlos en una GPU NVIDIA disponible mediante `--torch-device cuda`; es la ruta validada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponibles; el autor solo indica la opcion CUDA generica para el text encoder y el VAE, sin especificar modelos minimos ni recomendados.
- Ejecucion en GPU de consumo: no disponible. No se confirma si el pipeline completo cabe en una RTX 4090 u otras GPU de consumo.
- Ejecucion integramente en CPU: soportada, pero "sustancialmente mas lenta", especialmente en el decodificado del VAE.
- Host de validacion: instancia Lambda con 30 vCPU, sin GPU especificada mas alla del uso de CUDA para el text encoder y el VAE.
- Latencia observada: 368,6-402 s por imagen de 1024x1024 con 8 pasos en la configuracion hibrida CPU+GPU anterior.
- Throughput: no disponible.
- Opciones de despliegue: OpenVINO (runtime del transformer) y diffusers para el resto del pipeline. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Restriccion de entrada: las dimensiones de imagen deben ser divisibles por 16.
- Entorno: Python 3.11 y dependencias fijadas en `requirements.txt`; se recomienda una build de PyTorch acorde al sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de imagen | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xgirls/ernie-image-turbo-openvino-int4-awq | 8B (transformer) | 1024x1024 validado, dinamico divisible por 16 | OpenVINO IR INT4 AWQ + safetensors BF16 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| baidu/ERNIE-Image-Turbo (modelo base) | 8B (transformer) | no disponible | Diffusers, BF16 | Apache-2.0 | HuggingFace (referenciado como origen) |
| IR FP32 sin comprimir del mismo transformer | 8B (transformer) | no disponible | OpenVINO IR FP32, 30,0 GB | Apache-2.0 | Mencionado en la model card como fallback |
| Otras alternativas texto-a-imagen de 8B con cuantizacion OpenVINO | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Solo se dispone de datos comparativos frente al modelo base y frente al IR FP32 sin comprimir. No hay informacion en el material proporcionado sobre conversiones equivalentes de otros modelos texto-a-imagen ni sobre comparaciones de calidad objetivas.

## Limitaciones y advertencias

- Ausencia de validacion independiente: el repositorio tiene 0 descargas y 0 likes, y la unica evidencia de funcionamiento es una muestra generada por el propio autor con seed 42.
- Latencia elevada en CPU: entre 368,6 y 402 segundos por imagen de 1024x1024 en un host de 30 vCPU, lo que invalida su uso en aplicaciones interactivas sobre esa ruta.
- La comparacion de velocidad con BF16 CUDA reflejada en la model card no es equivalente, ya que mezcla rutas de hardware distintas; no debe citarse como speedup o slowdown limpio.
- Prompt enhancer omitido: `use_pe` esta deshabilitado, de modo que prompts ambiguos o muy cortos no se reescriben y pueden producir peores resultados que el modelo original.
- Idiomas no documentados: no se especifica que lenguas entiende el text encoder Mistral3 en este pipeline ni como se comporta con prompts en castellano; la unica evidencia es un prompt en ingles.
- Riesgo de degradacion por cuantizacion: la compresion INT4 con group-size 64 y ratio 0,9 puede introducir artefactos, especialmente en estructuras finas y en el renderizado de texto; no hay metricas que cuantifiquen esa perdida.
- Riesgo de alucinacion visual: sin benchmarks de fidelidad al prompt (FID, CLIP score, precision de texto) no es posible estimar con que frecuencia la imagen generada se desvia de la descripcion.
- Restriccion tecnica de dimensiones: las imagenes deben tener lados divisibles por 16, lo que limita ciertas relaciones de aspecto.
- Dependencia de dos rutas de ejecucion: el transformer va por OpenVINO y el text encoder y el VAE por PyTorch/CUDA, lo que complica el despliegue y el versionado de dependencias.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial, pero el autor remite a la model card de baidu/ERNIE-Image-Turbo para conocer los parametros recomendados y los terminos completos; conviene verificar la licencia upstream antes de un lanzamiento en produccion.
- Rendimiento en GPU de consumo sin confirmar: no se documenta si el pipeline completo cabe en tarjetas como la RTX 4090.
- Sin garantia de mantenimiento: la publicacion corresponde a un unico commit de octubre de 2026, sin historial de actualizaciones posterior en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xgirls/ernie-image-turbo-openvino-int4-awq
- Modelo base: https://huggingface.co/baidu/ERNIE-Image-Turbo
- Licencia incluida en el repositorio: LICENSE (archivo dentro del propio repositorio)
- Receta de cuantizacion: quantization_config.json (archivo dentro del propio repositorio)
- Muestra generada: sample_poster.png (archivo dentro del propio repositorio)
- Paper, blog tecnico o demo adicionales: no disponibles en la informacion proporcionada
