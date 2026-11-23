# zhiyi-ime/zhiyi-ml-pumpkin

## Resumen

Zhiyi ML-pumpkin-1103 es un modelo de clasificación de texto especializado en métodos de entrada (IME) multilingües, desarrollado por zhiyi-ime para el proyecto de código abierto Zhiyi IME. Se trata de un encoder ModernBERT de 12 capas y anchura 384, construido sobre el tokenizador de `jhu-clsp/mmBERT-small`, con 80.835.180 parámetros totales. Resuelve dos tareas concretas dentro de un motor de tecleo predictivo: la selección de palabra (asignar una puntuación a cada candidato de conversión) y la composición (convertir una secuencia larga de sílabas tecleadas en una frase, un carácter por sílaba).

El modelo cubre chino simplificado y tradicional (con esquemas pinyin, zhuyin, jyutping, cangjie y quick), japonés, coreano y vietnamita, además de inglés. Es la variante más grande de las cuatro que mantiene actualmente el proyecto, por delante de Flash (8 capas) y de los modelos centrados en chino e inglés Feather y Mini. Respecto a su predecesor ML-pumpkin-1026, incorpora una máscara de prefijo que permite calcular una sola vez las claves y valores del contexto y reutilizarlos en cada pulsación, además de una cabeza compartida para ambas tareas y dos épocas adicionales de entrenamiento.

La relevancia actual del modelo reside en su enfoque de eficiencia para inferencia en el propio dispositivo: los grafos ONNX int8 pesan entre 83 y 86 MB y están pensados para ejecutarse en CPU, con una variante que mantiene caché KV para evitar recomputar el contexto en cada tecla. La licencia Apache 2.0 facilita su integración tanto en proyectos personales como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (12 capas, anchura 384, `encoder.layer_types`, `prefix_mask`, `shared_head`) |
| Parametros totales | 80.835.180 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card describe ajustes de secuencia en `config.json` sin cifra explícita) |
| Tipos de cuantizacion | int8 (grafos ONNX); pesos safetensors sin cuantizar con encoder y cabeza en F16 y lectura de composición en F32; cuantización Q8_0 de las capas lineales al cargar |
| Idiomas soportados | zh (simplificado y tradicional), en, ja, ko, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`onnx/int8/laya.int8g.onnx`, `laya.one.int8g.onnx`, `laya.one.fused.int8g.onnx`), Rust candle (`candle_ref/`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 12 capas con anchura 384 que reutiliza el tokenizador de mmBERT (vocabulario Gemma de 256.000 tokens, sin modificaciones). Sobre el encoder se sitúa una única cabeza compartida (`shared_head`) que resuelve las dos tareas del IME: la elección de palabra, que produce una puntuación por candidato leída en el token `<mask>` que precede a cada candidato, y la composición, que emite `char_logits` con un carácter por cada sílaba tecleada. La innovación estructural clave es la `prefix_mask`, que permite calcular las claves y valores del bloque de contexto una sola vez y reutilizarlos en cada pulsación mediante caché KV, lo que reduce el coste por tecla a procesar únicamente la parte nueva de la secuencia.

El entrenamiento parte de ML-pumpkin-1026 (modelo por defecto de Zhiyi IME en las versiones 1.6.0 a 1.6.3) y añade dos épocas más con la cabeza unificada y la máscara de prefijo. Según el autor, el resultado mejora notablemente cuando no hay contexto y mantiene o supera la calidad cuando lo hay. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni menciona explícitamente fases de RLHF o DPO. El repositorio incluye `unified_vocab.json` con 3.805 unidades, 28 letras y 9.067 caracteres, además de las lecturas pinyin de 6.163 caracteres simplificados y las tablas del resto de idiomas bajo la clave `ml`.

## Capacidades

- Elección de palabra (word choice): asigna una puntuación a cada candidato de conversión en chino simplificado, inglés, chino tradicional (pinyin, zhuyin, jyutping, cangjie y quick), japonés, coreano y vietnamita.
- Composición: convierte una entrada larga escrita como frase, un carácter por sílaba tecleada (`char_logits`), en chino simplificado y tradicional (pinyin, zhuyin con tonos, jyutping) y japonés (kana).
- Procesamiento multilingüe con etiquetas de idioma explícitas (`<zh-Hant>`, `<ja>`, `<ko>`, `<vi>`) insertadas tras `<bos>` para las filas en esos idiomas.
- Inferencia con caché de contexto: el grafo `laya.one.int8g.onnx` opera en modo contexto (una vez por cambio de contexto) y modo tecla (en cada pulsación), reutilizando `past_enc_k/v` y `past_choice_k/v`.
- Ejecución en CPU mediante ONNX Runtime, con una variante que usa los operadores fusionados de atención y rotary (`laya.one.fused.int8g.onnx`).
- Implementación de referencia en Rust con candle 0.11 (`candle_ref/`, versión 0.4.0) para verificar portabilidades.
- Vectores de prueba (`test_vectors.safetensors`) con 16 entradas de elección de palabra y composición y las salidas del modelo ONNX fp32 para validar implementaciones.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un clasificador de texto acotado al dominio IME.

## Casos de uso

- Motor de tecleo predictivo en aplicaciones de escritorio y móviles: el modelo puntúa candidatos de conversión en cada pulsación y, gracias a la caché de contexto del grafo `laya.one.int8g.onnx`, solo procesa la parte nueva de la secuencia, lo que lo hace viable en CPU sin GPU dedicada.
- Teclados multilingües para usuarios de chino simplificado y tradicional: cubre pinyin, zhuyin, jyutping, cangjie y quick, de modo que un mismo binario sirve para distintos esquemas de entrada sin cargar modelos separados.
- Entrada de japonés, coreano y vietnamita en la misma aplicación: las filas de esos idiomas se procesan con los mismos grafos anteponiendo la etiqueta correspondiente, lo que simplifica el mantenimiento de un teclado poliglota.
- Composición de frases largas en chino: la tarea de composición convierte una secuencia de sílabas en una frase completa carácter a carácter, útil para entrada rápida de texto sin seleccionar candidato por candidato.
- Integración en editores y entornos de desarrollo con entrada CJK: al ser un modelo de 80,8 M de parámetros y grafos int8 de 83-86 MB, puede empaquetarse dentro de extensiones de editor sin dependencias de servidor.
- Validación y pruebas de implementaciones propias: los `test_vectors.safetensors` y la referencia en candle permiten comprobar que un port a otra plataforma reproduce las salidas esperadas antes de desplegarlo.
- Investigación en modelos compactos para IME: sirve como base para experimentos de cuantización Q8_0, atención con máscara de prefijo y cabezas compartidas en tareas de clasificación secuencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las notas de la release `model-ml-pumpkin-1103` en GitHub para los resultados de las pruebas, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas comparables en el texto proporcionado. El único dato numérico de salida disponible es el ejemplo de elección de palabra del caso 0: puntuaciones de 2,18, −7,06 y −7,95 en fp32 y de 2,16, −7,21 y −7,98 en int8 para los candidatos 散步, 散布 y 三部.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que los grafos ONNX int8 están diseñados para ejecutarse en CPU; el repo completo ocupa 0,5 GB y los grafos int8 entre 83 y 86 MB.
- GPU recomendadas: no se especifican en la información disponible; la variante `laya.one.fused.int8g.onnx` está marcada como solo CPU. El modo contexto usa tensores de paso cero sustituidos por un marcador de un paso porque DirectML no acepta tensores de longitud cero, lo que sugiere compatibilidad con ese backend en Windows.
- GPU de consumo: por tamaño (80,8 M de parámetros, encoder y cabeza en F16), el modelo cabe holgadamente en cualquier GPU de consumo, aunque el diseño apunta a ejecución en CPU.
- Opciones de despliegue: ONNX Runtime (versión probada 1.24.4), con los grafos `laya.int8g.onnx` (secuencia completa), `laya.one.int8g.onnx` (caché KV) y `laya.one.fused.int8g.onnx` (atención y rotary fusionados); implementación de referencia en Rust con candle 0.11; carga de safetensors con cuantización Q8_0 de las capas lineales.
- Latencia y throughput: no disponibles. La arquitectura de caché de contexto está pensada para minimizar el coste por pulsación, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Zhiyi ML-pumpkin-1103 | 80,8 M | 12 (anchura 384) | zh, en, ja, ko, vi, yue | no disponible | Apache 2.0 | Modelo mayor del proyecto, con prefix mask y cabeza compartida |
| Zhiyi ML-Flash | no disponible | 8 | multilingüe (mismo tokenizador que pumpkin) | no disponible | no disponible en la información | Variante ligera multilingüe, mismos tokenizador, vocabulario y entradas |
| Zhiyi Zhen-Feather | no disponible | no disponible | zh (simplificado y tradicional) + en | no disponible | no disponible en la información | Enfocado en chino e inglés |
| Zhiyi Zhen-Mini | no disponible | no disponible | zh (simplificado y tradicional) + en | no disponible | no disponible en la información | Variante pequeña para chino e inglés |

## Limitaciones y advertencias

- Modelo de dominio estrecho: no es un modelo generativo general; solo produce puntuaciones de candidatos y caracteres de composición, por lo que no debe emplearse para tareas de texto abiertas.
- Cobertura lingüística limitada a los idiomas declarados (zh, en, ja, ko, vi, yue); no se documenta comportamiento en otras lenguas.
- La model card no detalla sesgos conocidos, composición del dataset ni evaluación de alucinación; al ser un clasificador acotado, el riesgo de alucinación se limita a candidatos mal puntuados o composiciones incorrectas.
- La versión ML-pumpkin-1103 no está incluida en Zhiyi IME; para usar el modelo por defecto de la aplicación hay que recurrir a ML-pumpkin-1026.
- Los grafos int8 están cuantizados por separado y difieren ligeramente de las salidas fp32; para reproducir la precisión medida hay que cuantizar las capas lineales a Q8_0 al cargar los safetensors.
- El grafo fusionado `laya.one.fused.int8g.onnx` es solo para CPU; el modo contexto requiere un marcador de un paso en lugar de tensores de longitud cero por limitaciones de DirectML.
- No se publican métricas de latencia, throughput ni benchmarks de calidad en la información disponible, lo que dificulta estimar el rendimiento en producción sin ejecutar las pruebas de la release de GitHub.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar el aviso de licencia y verificar las licencias del tokenizador base de mmBERT en la distribución final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-ml-pumpkin
- Repositorio del proyecto Zhiyi IME: https://github.com/dd1000001000/zhiyi_ime
- Repositorio de modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Release model-ml-pumpkin-1103 (notas con resultados de pruebas): https://github.com/dd1000001000/zhiyi_models/releases/tag/model-ml-pumpkin-1103
- Modelo Zhiyi ML-Flash: https://huggingface.co/zhiyi-ime/zhiyi-ml-flash
- Modelo Zhiyi Zhen-Feather: https://huggingface.co/zhiyi-ime/zhiyi-zhen-feather
- Modelo Zhiyi Zhen-Mini: https://huggingface.co/zhiyi-ime/zhiyi-zhen-mini
- Modelo base jhu-clsp/mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
