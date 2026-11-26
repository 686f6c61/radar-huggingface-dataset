# Woleworks/lexicorder-mt-ja-en

## Resumen

Lexicorder-mt-ja-en es un modelo de traduccion automatica japones-ingles derivado de ElanMT-BT-ja-en, desarrollado originalmente por el proyecto ELAN MITSUA / Abstract Engine y convertido por Woleworks para su uso offline en la aplicacion Lexicorder. No se trata de un modelo nuevo: los pesos no se han reentrenado ni ajustado, sino unicamente exportados y cuantizados. Su interes radica en que empaqueta un traductor Marian de calidad decente en un formato ONNX int8 de apenas 0,1 GB, apto para ejecucion local en dispositivos sin GPU dedicada.

La arquitectura subyacente es un transformer encoder-decoder tipo MarianMT, el estandar clasico para traduccion neuronal desde 2020. El modelo cubre exclusivamente el par japones-ingles y se distribuye bajo licencia CC BY-SA 4.0, la misma que el modelo original, lo que impone obligaciones de atribucion y comparticion bajo la misma licencia.

Es relevante para desarrolladores que necesiten un traductor JA-EN ligero, ejecutable con ONNX Runtime sin dependencias de PyTorch, especialmente en aplicaciones de escritorio o moviles con conectividad limitada. No obstante, su alcance es acotado: sin KV cache en el decoder, sin soporte multilingue y con un conjunto de evaluacion muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime `quantize_dynamic`, QInt8) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (opset 17), encoder y decoder separados |

## Arquitectura y entrenamiento

El modelo es un MarianMT estandar, la arquitectura de traduccion neuronal de Helsinki-NLP ampliamente adoptada para pares de idiomas de nicho. La conversion realizada por Woleworks exporta el modelo original de PyTorch a ONNX en dos grafos independientes: `encoder_model.onnx` (recibe `input_ids` y `attention_mask`, devuelve `last_hidden_state`) y `decoder_model.onnx` (recibe `input_ids`, `encoder_attention_mask` y `encoder_hidden_states`, devuelve `logits`). El decoder no incluye KV cache, lo que simplifica el grafo pero penaliza el rendimiento en secuencias largas al recalcular atencion en cada paso.

La cuantizacion aplicada es dinamica a int8 mediante `quantize_dynamic` de ONNX Runtime, que cuantiza pesos en tiempo de carga y activaciones en tiempo de ejecucion. El tokenizador se reconstruyo a partir de `vocab.json` (ids de pieza) y `source.spm` (puntuaciones de pieza), generando un `tokenizer.json` con vocabulario Unigram como array de pares `[piece, score]`. El `config.json` se copia sin cambios del original. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO; la model card remite al modelo original para esos detalles.

## Capacidades

- Traduccion de texto japones a ingles en una unica direccion.
- Normalizacion NFKC y segmentacion SentencePiece Unigram en el preprocesado.
- Decodificacion greedy con inicio en `decoder_start_token_id` y parada en `eos_token_id`.
- Ejecucion offline sin dependencias de PyTorch, solo ONNX Runtime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- No es multilingue: solo ja y en.
- No soporta traduccion inversa (en a ja).

## Casos de uso

- Traduccion offline en aplicaciones de escritorio: el modelo puede integrarse en una app tipo Lexicorder para traducir texto japones sin conexion, gracias a su tamano de 0,1 GB y a la ausencia de dependencias pesadas.
- Procesamiento por lotes de documentos japoneses: util para preprocesar corpus, subtitulos o articulos antes de un pipeline de NLP en ingles, ejecutando ONNX Runtime en CPU.
- Traduccion embebida en dispositivos moviles o de bajos recursos: la cuantizacion int8 y el formato ONNX permiten desplegar el modelo en entornos con RAM limitada y sin GPU.
- Herramientas de lectura asistida: extensiones de navegador o lectores que traduzcan parrafos japoneses al vuelo en local, preservando la privacidad del texto del usuario.
- Prototipado rapido de sistemas de traduccion: sirve como baseline ligero antes de invertir en modelos mayores o APIs comerciales.
- Filtrado y enriquecimiento de datos: traduccion de titulos, metadatos o descripciones japonesas a ingles para indexacion y busqueda en bases de datos.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| chrF (test propio de 32 frases, greedy, referencia unica) | 74,0 | Conjunto muy pequeno; valor orientativo |
| chrF del modelo anterior de la app (Opus-MT ja-en) | 66,4 | Misma prueba |

No se han publicado resultados de benchmarks estandar (WMT, MMLU, etc.) en la informacion disponible. La unica metrica reportada es la comparacion interna de la aplicacion, que no es directamente comparable con evaluaciones academicas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8; el modelo completo ocupa aproximadamente 0,1 GB en disco.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo, pero es sobredimensionada para esta carga.
- Cabe en cualquier GPU de consumo e incluso en CPU de portatiles y dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (principal), con posibles exportaciones a otros runtimes compatibles con ONNX; no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no soportan MarianMT en ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ausencia de KV cache en el decoder implica recalculo de atencion en cada token generado, lo que reduce el throughput en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Woleworks/lexicorder-mt-ja-en | no disponible | no disponible | ja, en | CC BY-SA 4.0 | ONNX int8 | Conversion cuantizada de ElanMT-BT-ja-en |
| Mitsua/elan-mt-bt-ja-en | no disponible | no disponible | ja, en | CC BY-SA 4.0 | PyTorch (safetensors) | Modelo original, sin cuantizar |
| Helsinki-NLP/opus-mt-ja-en | no disponible | no disponible | ja, en | CC BY 4.0 | PyTorch, ONNX | Baseline clasico; chrF 66,4 en el test interno de Lexicorder |

No se dispone de datos suficientes para comparar parametros, contexto ni rendimiento en benchmarks estandar entre estos modelos.

## Limitaciones y advertencias

- Traducciones potencialmente incorrectas, daninas o sesgadas, segun advierten los autores originales.
- No apto para usos que requieran alta precision en traduccion.
- Conjunto de evaluacion de solo 32 frases: el chrF de 74,0 no es estadisticamente representativo.
- Solo traduce ja a en; no soporta la direccion inversa ni otros pares.
- Sin KV cache en el decoder: ineficiente para secuencias largas.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a atribucion y a compartir obras derivadas bajo la misma licencia.
- Los autores originales declinan responsabilidad por perdidas derivadas del uso del modelo (seccion 5 de la licencia).
- Los archivos convertidos se ofrecen "as is", sin garantia.
- No hay informacion publica sobre sesgos especificos ni sobre el corpus de entrenamiento en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Woleworks/lexicorder-mt-ja-en
- Modelo original: https://huggingface.co/Mitsua/elan-mt-bt-ja-en
- Proyecto ELAN MITSUA: https://elanmitsua.com/en/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Commit del modelo base: `539f80eb05306e27a166b45e4264c7fa2eb4de97` (en el repositorio de Mitsua/elan-mt-bt-ja-en)
