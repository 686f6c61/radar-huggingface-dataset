# TigreGotico/kolokwa-g2p-onnx

## Resumen

Kolokwa G2P ONNX es la exportación a formato ONNX del modelo `michsethowusu/kolokwa-g2p`, un sistema de conversión grafema-a-fonema (G2P) especializado en inglés liberiano (kolokwa, ISO 639-3 `lir`). El modelo original lo desarrolló michsethowusu; esta versión ONNX la publica TigreGotico con el objetivo de permitir la inferencia sin PyTorch, únicamente con `onnxruntime` y `numpy`.

La arquitectura es un Forward Transformer no autorregresivo de 6 capas, perteneciente al paquete `phonemize` versión 0.2.4. El modelo transforma palabras en su representación IPA, apoyándose en un diccionario de pronunciación de 12.006 palabras y, cuando la palabra no está en el diccionario, en una lectura carácter a carácter con repetición triple de cada letra. El resultado es un fonemizador ligero (repo de 0,1 GB) pensado como componente previo en pipelines de texto-a-voz.

Su relevancia es doble: por un lado, cubre una variedad lingüística poco atendida (el inglés liberiano) y, por otro, ofrece una exportación verificada con paridad byte a byte frente al checkpoint original en 12.161 palabras del léxico y 11 frases de prueba, lo que lo hace fiable para integrarse en producción sin dependencia de torch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Forward Transformer no autorregresivo, 6 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una palabra por invocación, sin padding) |
| Tipos de cuantizacion | no disponible (exportación ONNX en float32) |
| Idiomas soportados | inglés liberiano (kolokwa, `lir`) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18), más `kolokwa.json` con tablas de tokens y diccionario |

## Arquitectura y entrenamiento

El modelo es un Forward Transformer no autorregresivo de 6 capas, integrado en el paquete `phonemize` 0.2.4. La entrada es una secuencia de ids de tokens int64 de forma `[1, length]` correspondiente a una única palabra sin padding; la salida son logits float32 de forma `[1, length, 65]`, que se decodifican por argmax. El preprocesamiento repite cada letra tres veces (`char_repeats: 3`), pasa a minúsculas y delimita la secuencia con tokens de inicio y fin.

El entrenamiento se realizó sobre el dataset `michsethowusu/kolokwa-text-ipa-jw`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo etapas de ajuste fino con RLHF o DPO. La innovación técnica destacable de esta exportación es la paridad funcional: se comparó con `phonemize` 0.2.4 y el checkpoint original sobre torch 2.8.0, con salida byte a byte idéntica en las 12.161 palabras de `lexicon.tsv` (con y sin diccionario) y en 11 frases de muestra con mayúsculas, guiones y puntuación.

## Capacidades

- Conversión de texto a IPA para inglés liberiano (kolokwa), palabra a palabra.
- Fonemización basada en diccionario de 12.006 palabras, con búsqueda en forma literal, minúsculas y capitalizada.
- Fonemización de palabras fuera del diccionario mediante lectura carácter a carácter con repetición triple de letras.
- Segmentación de texto por espacios y por los caracteres `().,:?!/–`, conservando esos caracteres en la salida.
- División de palabras desconocidas por guiones y ante mayúsculas internas, procesando cada parte por separado.
- Inferencia sin torch: solo requiere `onnxruntime` y `numpy`.
- Integración mediante `scriptconv` como `Phonemizer.KOLOKWA`.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Síntesis de voz para inglés liberiano: el modelo actúa como etapa G2P previa a un TTS, convirtiendo cada palabra en IPA antes de la generación acústica; su ligereza (0,1 GB) permite ejecutarlo en el mismo proceso que el sintetizador.
- Normalización fonética en pipelines de datos: procesar corpus de texto kolokwa para obtener transcripciones IPA y alimentar modelos de reconocimiento o alineamiento fonético.
- Aplicaciones educativas de pronunciación: mostrar la transcripción IPA de palabras y frases a estudiantes de inglés liberiano, con cobertura del diccionario y respaldo carácter a carácter para términos nuevos.
- Despliegue en entornos sin PyTorch: servicios en contenedores mínimos donde solo se dispone de `onnxruntime`, por ejemplo funciones serverless o dispositivos embebidos.
- Preprocesamiento en sistemas de accesibilidad: convertir texto a fonemas para lectores de pantalla o sistemas de comunicación aumentativa orientados a hablantes de kolokwa.
- Investigación lingüística: generar transcripciones IPA sistemáticas de léxicos y corpus para estudios fonológicos del inglés liberiano.
- Integración en herramientas de código abierto: uso vía `scriptconv` (`Phonemizer.KOLOKWA`) dentro de aplicaciones Python que ya emplean esa librería para otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pruebas de paridad con el modelo original:

| Prueba | Casos | Coincidencias |
|---|---|---|
| Todas las palabras de `lexicon.tsv` leídas como texto | 12.161 | 12.161 |
| Todas las palabras de `lexicon.tsv` solo con el modelo, sin diccionario | 12.161 | 12.161 |
| 5 frases de la model card original y 6 textos con mayúsculas, guiones y puntuación | 11 | 11 |

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 0,1 GB y el modelo es un transformer de 6 capas, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no se especifican; al ejecutarse con `onnxruntime` puede correr en CPU sin problema, y en GPU cualquier tarjeta compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) es sobredimensionada para esta carga.
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: `onnxruntime` (Python), integración vía `scriptconv`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| TigreGotico/kolokwa-g2p-onnx | G2P Forward Transformer 6 capas (ONNX) | `lir` | palabra a palabra | MIT | ONNX |
| michsethowusu/kolokwa-g2p | G2P Forward Transformer 6 capas (torch) | `lir` | palabra a palabra | MIT | checkpoint torch |
| `phonemize` 0.2.4 (paquete) | Framework G2P con modelos por idioma | múltiples | palabra a palabra | no disponible | Python |

No se dispone de datos de rendimiento comparativo entre estos modelos más allá de la paridad exacta entre la exportación ONNX y el checkpoint original.

## Limitaciones y advertencias

- Cobertura lingüística restringida al inglés liberiano (kolokwa); no es un modelo multilingüe ni de propósito general.
- Procesa una palabra por invocación y sin padding; la segmentación del texto la realiza la capa de preprocesamiento, no el grafo ONNX.
- Las palabras fuera del diccionario dependen de la lectura carácter a carácter, lo que puede producir transcripciones menos precisas en términos irregulares o préstamos.
- Un palabra sin ninguna letra conocida en `text_tokens` no produce fonemas.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluación cualitativa de errores fonéticos.
- Licencia MIT, lo que permite uso comercial; conviene conservar la atribución al autor original (michsethowusu) y verificar los términos del checkpoint base.
- Los bytes de `model.onnx` pueden diferir entre reconstrucciones; los ficheros del repositorio son la referencia canónica.
- No apto para tareas de generación de texto, razonamiento, código o diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/kolokwa-g2p-onnx
- Modelo base: https://huggingface.co/michsethowusu/kolokwa-g2p
- Dataset de entrenamiento: https://huggingface.co/datasets/michsethowusu/kolokwa-text-ipa-jw
- Paquete `phonemize`: https://pypi.org/project/phonemize/
- Repositorio `scriptconv`: https://github.com/TigreGotico/scriptconv
