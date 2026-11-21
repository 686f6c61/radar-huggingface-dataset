# ukrbublik/opus-mt-ro-ru-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-ro-ru-int8-shift-att` es una conversión a ONNX con cuantización INT8 de un modelo de traducción automática neuronal del proyecto OPUS-MT, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki (Jörg Tiedemann et al.). Concretamente, deriva de `Helsinki-NLP/opus-mt-tc-bible-big-mul-mul`, un modelo multilingüe Marian entrenado sobre datos OPUS, del que se ha aislado la dirección rumano→ruso mediante un prefijo de token de origen (`>>rus<<`). El resultado es un par encoder/decoder ONNX de propósito único para traducción directa ro→ru, sin pivote por inglés.

La relevancia de esta ficha es acotada pero técnica: no se trata de un modelo nuevo ni de un entrenamiento original, sino de un artefacto de despliegue optimizado para inferencia en dispositivo (on-device), pensado para la aplicación Android Subtitle Tap. Incorpora dos particularidades destacables: cuantización dinámica INT8 por tensor (QInt8) vía onnxruntime, y una salida adicional `alignment_shift_l2` que expone las probabilidades de atención encoder-decoder de la capa 2 del decoder, útil para alinear tokens origen-destino en subtítulos.

El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta. Al ser una conversión de formato, sus capacidades lingüísticas y limitaciones son heredadas del modelo base multilingüe de OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), exportado a ONNX (opset 17, sin past key/values) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | rumano (ro) como origen, ruso (ru) como destino |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder estándar para traducción automática neuronal, en la variante multilingüe `opus-mt-tc-bible-big-mul-mul` de OPUS-MT. El modelo original es multi-target y multi-source: selecciona el idioma de destino mediante un token de prefijo en la oración de origen. En esta conversión, `tokenizer_runtime.json` inyecta `>>rus<<` antes de cada frase fuente (`sourcePrefixTokenIds`) para fijar el ruso como destino.

El entrenamiento original corresponde al proyecto OPUS-MT sobre datos OPUS (incluyendo corpus bíblicos y de subtítulos, según la nomenclatura `tc-bible-big`), y no se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. Esta conversión no reentrena pesos: solo cambia el formato (export ONNX con optimum, opset 17, sin past key/values) y aplica cuantización INT8 dinámica. La innovación técnica local es la salida `alignment_shift_l2`, una identidad sobre un nodo existente que expone las probabilidades de atención encoder-decoder de la capa 2 del decoder sin alterar pesos ni decodificación; `alignment.json` liga esa salida al SHA-256 del decoder como recibo de integridad.

## Capacidades

- Traducción automática directa rumano→ruso, sin pivote por inglés.
- Exposición de alineamientos de atención (capa 2 del decoder) para mapear tokens origen-destino.
- Inferencia en dispositivo vía onnxruntime con pesos INT8.
- Tokenizador SentencePiece empaquetado en JSON con piezas, puntuaciones e ids de vocabulario.
- Selección de idioma destino mediante prefijo `>>rus<<` (heredado del modelo multilingüe).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento (thinking).

## Casos de uso

- Subtitulado en tiempo real en Android: la app Subtitle Tap puede traducir subtítulos ro→ru directamente en el dispositivo con los dos grafos ONNX cuantizados, evitando latencia de red y costes de API.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar tokens rumanos y rusos para generar pistas SRT sincronizadas o resaltados palabra a palabra.
- Traducción offline en dispositivos de gama media: al ser INT8 y sin past key/values, el modelo reduce huella de memoria y es viable en hardware móvil sin GPU dedicada.
- Procesamiento por lotes de corpus ro→ru: integrable en pipelines Python con onnxruntime para traducir documentos o datasets de investigación de forma local y reproducible.
- Verificación de integridad en despliegues: `alignment.json` con el SHA-256 del decoder permite auditar que el binario desplegado corresponde al publicado.
- Prototipado de sistemas de traducción sin dependencia de servicios en la nube: útil en entornos con requisitos de privacidad (contenido médico, legal o periodístico que no debe salir del dispositivo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,4 GB; la inferencia INT8 requiere del orden de cientos de MB de memoria, aunque el dato exacto de pico no está disponible.
- GPU recomendadas: no disponible; al ser un modelo pequeño cuantizado, es apto para CPU y GPUs de consumo, pero no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí por tamaño, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: onnxruntime (formato nativo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-ro-ru-int8-shift-att | no disponible | no disponible | ro→ru | apache-2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-tc-bible-big-mul-mul (base) | no disponible | no disponible | multilingüe (mul→mul) | apache-2.0 | safetensors/PyTorch |
| Otros OPUS-MT ro→ru de Helsinki-NLP | no disponible | no disponible | ro→ru | apache-2.0 | PyTorch |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato (ONNX INT8 frente a PyTorch) y la salida de alineamiento añadida.

## Limitaciones y advertencias

- Modelo de propósito único: solo traduce ro→ru; no es un modelo generalista.
- Calidad heredada del modelo base multilingüe; no se han publicado evaluaciones específicas para esta conversión.
- Riesgo de alucinación y errores de traducción en dominios alejados de los datos OPUS (texto técnico, jerga, nombres propios).
- La cuantización INT8 puede degradar ligeramente la calidad frente al modelo en precisión completa; no se documenta la magnitud de esa pérdida.
- Sin past key/values en el export: la decodificación puede ser menos eficiente en secuencias largas.
- La salida `alignment_shift_l2` es una identidad sobre un nodo existente; su semántica depende de la implementación y no debe asumirse estable entre versiones.
- Licencia apache-2.0 permite uso comercial, pero se exige atribución a los autores originales (Tiedemann y Thottingal, 2020).
- Sin descargas ni validación comunitaria en el momento de la consulta: tratar como artefacto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/ukrbublik/opus-mt-ro-ru-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-mul-mul
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible en la información proporcionada
- Repositorio OPUS-MT: no disponible en la información proporcionada
- Aplicación Subtitle Tap: no disponible en la información proporcionada
