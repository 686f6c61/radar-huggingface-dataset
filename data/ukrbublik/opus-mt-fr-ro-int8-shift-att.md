# ukrbublik/opus-mt-fr-ro-int8-shift-att

## Resumen

OPUS-MT fr→ro INT8 ONNX con salida de alineamiento Shift-Att es una conversión del modelo de traducción automática Helsinki-NLP/opus-mt-fr-ro, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (proyecto OPUS-MT, Jörg Tiedemann et al.). El autor de esta conversión es ukrbublik, que lo publica para el runtime OPUS en el dispositivo de la aplicación Android Subtitle Tap.

El modelo resuelve la traducción directa francés→rumano sin pivotar a través del inglés, lo que reduce latencia y errores de propagación en entornos de subtitulado. Se distribuye como exportación ONNX (opset 17) con cuantización dinámica INT8 por tensor (QInt8) mediante onnxruntime, lo que reduce el tamaño del repositorio a 0,1 GB y lo hace apto para inferencia en dispositivos móviles.

La innovación principal es la exposición de una salida adicional de alineamiento: el decoder emite `alignment_shift_l2`, las probabilidades de atención encoder-decoder de la capa 2, implementada como una Identity sobre un nodo existente sin alterar pesos ni decodificación. Esto permite obtener correspondencias token a token entre origen y destino, útil para subtitulado sincronizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime; export ONNX opset 17 |
| Idiomas soportados | fr (frances), ro (rumano) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT (transformer encoder-decoder) entrenado por el proyecto OPUS-MT sobre datos del corpus OPUS. Esta conversión concreta mantiene la arquitectura y los pesos originales: únicamente cambia el formato (exportación ONNX con optimum, opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor con onnxruntime. El decoder incorpora una salida adicional `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2 mediante una Identity sobre un nodo existente, sin modificar pesos ni el proceso de decodificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el modelo base se entrenó sobre datos OPUS según la atribución del autor. El repositorio incluye `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece original mapeadas a ids de vocabulario, más las cadenas de tokens destino) y `alignment.json`, un recibo que vincula la salida de alineamiento con el SHA-256 del decoder.

## Capacidades

- Traducción automática directa francés→rumano, sin pivotar por inglés.
- Salida de alineamiento token a token mediante `alignment_shift_l2` (atención encoder-decoder de la capa 2).
- Tokenización SentencePiece empaquetada en formato JSON para uso en runtime propio.
- Inferencia en dispositivo (on-device) gracias a la cuantización INT8 y al formato ONNX.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada exclusivamente al par fr→ro.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap usa el modelo en el dispositivo para traducir subtítulos de francés a rumano sin conexión, con la salida de alineamiento para sincronizar los tiempos de cada segmento.
- Traducción de documentos ofensivos en dispositivos sin conectividad: al ejecutarse vía ONNX Runtime en local, permite procesar texto sensible sin enviarlo a servicios en la nube.
- Integración en pipelines de traducción por lotes: el formato ONNX permite desplegar el modelo con onnxruntime en servidores ligeros para traducir grandes volúmenes de texto fr→ro con bajo coste computacional.
- Preprocesamiento para análisis de contenido multilingüe: traducción de reseñas, comentarios o tickets en francés a rumano para su posterior procesamiento con modelos de clasificación o análisis de sentimiento.
- Traducción de interfaces y cadenas de aplicación: el modelo puede traducir textos cortos de UI de francés a rumano en tiempo de compilación o en tiempo de ejecución en aplicaciones móviles.
- Investigación en alineación de palabras: la salida `alignment_shift_l2` permite estudiar correspondencias léxicas entre fr y ro y evaluar técnicas de extracción de alineamientos a partir de atención, sin necesidad de herramientas externas de alineación.
- Generación de corpus paralelos: uso del alineamiento para producir pares de segmentos alineados a nivel de token a partir de textos monolingües franceses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,1 GB en INT8; la huella en memoria es muy reducida (del orden de cientos de MB incluyendo overhead de onnxruntime), aunque no se especifica una cifra exacta.
- GPU recomendadas: al ser un modelo Marian de tamaño base cuantizado, puede ejecutarse en CPU sin GPU; en caso de usar GPU, cualquier tarjeta moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en dispositivos móviles Android, que es el objetivo declarado del autor.
- Opciones de despliegue: ONNX Runtime (principal, usado por el runtime OPUS de Subtitle Tap); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato y arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-fr-ro-int8-shift-att | no disponible | no disponible | apache-2.0 | ONNX INT8 | Salida de alineamiento, orientado a on-device |
| Helsinki-NLP/opus-mt-fr-ro (base) | no disponible | no disponible | apache-2.0 | safetensors/PyTorch | Modelo original sin cuantizar ni salida de alineamiento |
| Helsinki-NLP/opus-mt-en-ro | no disponible | no disponible | apache-2.0 | safetensors/PyTorch | Requiere pivotar por inglés para fr→ro |
| Helsinki-NLP/opus-mt-fr-en | no disponible | no disponible | apache-2.0 | safetensors/PyTorch | Primer tramo de una traducción con pivote |

## Limitaciones y advertencias

- El modelo solo traduce francés→rumano; no admite otros pares de idiomas ni direccionalidad inversa.
- Al ser una cuantización INT8 dinámica, puede producirse una ligera degradación de calidad respecto al modelo base en frases largas o ambiguas; no se han publicado métricas que la cuantifiquen.
- No se dispone de información sobre sesgos específicos del par fr→ro ni sobre evaluación de sesgo del modelo base.
- Riesgo de alucinación y de traducciones literalmente incorrectas en dominios especializados (técnico, jurídico, médico), habitual en modelos NMT de tamaño base.
- La longitud máxima de contexto no está documentada; el modelo base Marian suele limitarse a secuencias de unos 512 tokens, pero este dato no se confirma en la información disponible.
- La licencia apache-2.0 permite uso comercial, pero se recomienda mantener la atribución al grupo de la Universidad de Helsinki indicada por el autor.
- La salida de alineamiento `alignment_shift_l2` no está validada con métricas públicas; su calidad como alineador debe evaluarse empíricamente antes de usarla en producción.
- El modelo está pensado para el runtime OPUS de Subtitle Tap; su integración en otros stacks requiere adaptar el tokenizador JSON y el grafo ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-fr-ro-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-ro
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: https://opus.nlpl.eu/
- ONNX Runtime: https://onnxruntime.ai/
- optimum (exportación ONNX): https://huggingface.co/docs/optimum
