# ukrbublik/opus-mt-uk-tr-int8-shift-att

## Resumen

`ukrbublik/opus-mt-uk-tr-int8-shift-att` es una conversion a ONNX con cuantizacion INT8 del modelo de traduccion `Helsinki-NLP/opus-mt-uk-tr`, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El modelo traduce directamente entre ucraniano (uk) y turco (tr) sin pivotar por el ingles, y esta pensado para ejecucion en dispositivo dentro de la aplicacion Android Subtitle Tap.

La aportacion especifica de este repositorio no es el entrenamiento, sino el formato: exporta el encoder y el decoder a ONNX (opset 17, sin past key/values), aplica cuantizacion dinamica INT8 de onnxruntime (QInt8, per-tensor) y anade una salida auxiliar `alignment_shift_l2` que expone las probabilidades de atencion encoder-decoder de la capa 2, util para alinear subtitulos con el texto de origen. Los pesos y el proceso de decodificacion no se modifican respecto al modelo original.

Por tanto, es relevante para quien necesite un traductor ucraniano-turco ligero, empaquetable en un APK o en un runtime movil, con licencia permisiva (Apache 2.0) y con informacion de alineacion de tokens. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un modelo Marian de tipo base cuantizado a INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq Marian (encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ucraniano (uk), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), opset 17 |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian, la arquitectura seq2seq de traduccion automatica neuronal desarrollada en el marco del proyecto OPUS-MT. Consta de un encoder y un decoder transformer con atencion cruzada; en esta conversion se exporta sin cache de past key/values, lo que simplifica el grafo ONNX a costa de no reutilizar estados entre pasos de decodificacion. La cuantizacion es dinamica INT8 per-tensor sobre las activaciones, aplicada por onnxruntime, y no altera los pesos en coma flotante originales mas alla del redondeo implicito de la cuantizacion.

El entrenamiento original se realizo con datos del corpus OPUS (coleccion de corpus paralelos multilingues), tal como describe la atribucion de la model card. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre si hubo etapas de RLHF o DPO; el modelo original de OPUS-MT no documenta esas fases en la informacion proporcionada. La innovacion tecnica de este repositorio es doble: la exportacion ONNX para inferencia en dispositivo y la exposicion de `alignment_shift_l2`, una salida Identity sobre un nodo existente que devuelve las probabilidades de atencion de la capa 2 del decoder, junto con un `alignment.json` que vincula esa salida al SHA-256 del decoder para verificacion de integridad.

## Capacidades

- Traduccion directa ucraniano a turco y, por la naturaleza bidireccional del par en OPUS-MT, turco a ucraniano (el repositorio se presenta como un unico modelo directo, sin pivot por ingles).
- Generacion de texto secuencial token a token mediante encoder-decoder, con tokenizer SentencePiece empaquetado en `tokenizer_runtime.json`.
- Salida de alineacion de atencion (`alignment_shift_l2`) para correlacionar tokens de origen y destino, util en tareas de subtitulado.
- Inferencia en dispositivo via onnxruntime, sin dependencia de GPU ni de servicios en la nube.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al par uk-tr; no se documentan otros idiomas.

## Casos de uso

- Subtitulado automatico en Android: la aplicacion Subtitle Tap usa este modelo para traducir subtitulos ucranianos a turco en el dispositivo, con la salida de alineacion para sincronizar el texto traducido con los tiempos del subtitulo original.
- Traduccion offline en movilidad: al ser un modelo INT8 de ~0,1 GB, puede empaquetarse en una app y funcionar sin conexion, util para viajeros o zonas con conectividad limitada entre Ucrania y Turquia.
- Procesamiento por lotes de documentos uk-tr: integrado en un pipeline con onnxruntime, permite traducir grandes volumenes de texto en servidores CPU sin GPU, gracias a la cuantizacion INT8.
- Investigacion en alineacion de tokens: la salida `alignment_shift_l2` permite estudiar correspondencias lexicas entre ucraniano y turco, o construir herramientas de traduccion asistida que resalten el token de origen de cada palabra traducida.
- Verificacion de integridad en produccion: el `alignment.json` con el SHA-256 del decoder permite validar que el binario desplegado no ha sido alterado, relevante en distribuciones de apps moviles.
- Prototipado rapido de traduccion en entornos edge: al ser ONNX, se puede desplegar en dispositivos con poca memoria (moviles, Raspberry Pi) mediante onnxruntime, sin necesidad de infraestructura de servidores.
- Generacion de subtitulos bilingues en streaming: combinado con un ASR que produzca texto ucraniano, el modelo traduce fragmentos cortos con baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues, ya que el modelo esta pensado para CPU con onnxruntime; en GPU, el modelo INT8 de ~0,1 GB ocupa una fraccion minima de VRAM (estimacion orientativa inferior a 1 GB, no confirmada por el autor).
- GPU recomendadas: no se especifican; el modelo es lo bastante pequeno para ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede alojarlo sin problema, pero no es el escenario objetivo.
- Cabe en GPU consumer: si, con margen amplio, aunque el diseno apunta a inferencia en dispositivo movil.
- Opciones de despliegue: onnxruntime (CPU y GPU), integracion directa en Android mediante el runtime OPUS de Subtitle Tap. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de la familia Llama ni GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ukrbublik/opus-mt-uk-tr-int8-shift-att | no disponible | no disponible | uk, tr | Apache 2.0 | ONNX INT8 | Conversion cuantizada con salida de alineacion |
| Helsinki-NLP/opus-mt-uk-tr | no disponible | no disponible | uk, tr | Apache 2.0 | safetensors/PyTorch | Modelo original sin cuantizar ni salida de alineacion |
| Helsinki-NLP/opus-mt-en-tr | no disponible | no disponible | en, tr | Apache 2.0 | safetensors/PyTorch | Requiere pivot por ingles para uk-tr |
| Helsinki-NLP/opus-mt-uk-en | no disponible | no disponible | uk, en | Apache 2.0 | safetensors/PyTorch | Requiere pivot por ingles para uk-tr |

La comparativa se limita a variantes del ecosistema OPUS-MT, ya que no se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La ventaja diferencial de este repositorio es el formato ONNX INT8 y la salida de alineacion; la desventaja es la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- No se han publicado benchmarks de calidad de traduccion (BLEU, COMET u otras metricas) para esta conversion, por lo que el impacto de la cuantizacion INT8 en la calidad no esta cuantificado.
- La cuantizacion dinamica INT8 puede degradar ligeramente la fidelidad de la traduccion respecto al modelo en coma flotante original, especialmente en frases largas o con terminologia especializada.
- Riesgo de alucinacion y de traducciones literales en expresiones idiomaticas, propio de los modelos Marian entrenados sobre corpus paralelos de dominio general.
- Cobertura limitada al par ucraniano-turco; no se documentan otros pares ni capacidades multilingues adicionales.
- La longitud de contexto no esta especificada; los modelos Marian de OPUS-MT suelen manejar secuencias de hasta 512 tokens, pero este dato no se confirma en la informacion disponible.
- La salida de alineacion depende de la atencion de la capa 2 y puede no ser fiable en frases con orden de palabras muy distinto entre ambos idiomas.
- Licencia Apache 2.0 permisiva para uso comercial, pero se debe mantener la atribucion al grupo de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- El modelo esta disenado para el runtime OPUS de Subtitle Tap; su integracion en otros entornos requiere adaptar el tokenizer y el manejo de la salida de alineacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-uk-tr-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-tr
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61/
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS: https://opus.nlpl.eu/
