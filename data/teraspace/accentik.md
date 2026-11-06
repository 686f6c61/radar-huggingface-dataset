# TeraSpace/accentik

## Resumen

Accentik es un modelo ligero de extraccion de caracteristicas desarrollado por TeraSpace que resuelve un problema muy concreto del procesamiento del ruso: la colocacion automatica de marcas de acento (word stress) en texto. El modelo inserta un simbolo `+` delante de la vocal tonica de cada palabra rusa con mas de una vocal, usando el contexto circundante para desambiguar palabras como "замок" (castillo/cerradura), cuya acentuacion depende del significado. Ademas, incorpora de forma opcional y experimental una cabeza paralela para la restauracion de la letra `ё` (conversion `е` → `ё`), desactivada por defecto.

Tecnicamente, Accentik es un ajuste fino de deepvk/RuModernBERT-small, un encoder tipo BERT modernizado entrenado en ruso, con 35,05 millones de parametros y una unica pasada de encoder con cabezas de clasificacion paralelas (acento, residuo de contexto local y `ё`). Su relevancia radica en que funciona sin diccionarios, sin analizadores morfologicos y sin decodificacion autorregresiva, lo que lo hace ideal como preprocesador para sistemas de sintesis de voz (TTS) en ruso. Se distribuye en safetensors FP32 (unos 140 MB) bajo una licencia propia tipo OpenRAIL con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo ModernBERT (fine-tune de deepvk/RuModernBERT-small) con cabezas de acento, residuo de contexto local y `ё` |
| Parametros totales | 35.053.563 (aprox. 35,05 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de hasta 512 tokens (procesamiento por palabras completas) |
| Tipos de cuantizacion | FP32 (peso unico model.safetensors); BF16 via autocast en CUDA |
| Idiomas soportados | Ruso (ru) |
| Licencia | accentik-openrail-m-public-attribution (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Accentik parte de deepvk/RuModernBERT-small, una arquitectura encoder basada en ModernBERT adaptada al ruso. Sobre el encoder compartido se anaden cabezas de clasificacion paralelas: una cabeza de acentuacion por palabra, una cabeza de residuo de contexto local y una cabeza opcional para la prediccion de `ё`. La inferencia se realiza en una sola pasada del encoder, sin decodificacion autorregresiva, y utiliza PyTorch SDPA como mecanismo de atencion (no requiere flash-attn).

Los detalles del entrenamiento (numero de tokens, composicion exacta del dataset, uso de RLHF/DPO) no estan disponibles. La model card indica que esta version refina la prediccion de acentos usando etiquetas acusticas y "contextual replay", y que las etiquetas de dialogo en ruso fueron generadas por RUAccent, por lo que las metricas de evaluacion miden la concordancia con dichas etiquetas. Los resultados agregados de evaluacion y las regresiones conocidas se recogen en el fichero evaluation.json del repositorio.

## Capacidades

- Colocacion automatica de marcas de acento (`+`) en palabras rusas con dos o mas vocales, resolviendo ambiguedades por contexto.
- Restauracion experimental de `ё` (conversion `е` → `ё`) mediante el parametro `restore_yo=True`, con umbral de confianza seleccionado en validacion de 0,8 (ajustable via `yo_threshold`).
- Inferencia por lotes (`accentuate_batch`) y anotacion estructurada (`annotate`, `annotate_many`) con posiciones de caracteres, puntuaciones de confianza (softmax sin calibrar) e indicadores de decision.
- Respeto de marcas manuales: los signos `+` preexistentes y los acentos agudos combinantes (como en "молоко́") prevalecen sobre la decision del modelo.
- Preservacion exacta del texto original: capitalizacion, puntuacion, espacios, saltos de linea, signos matematicos y texto en ingles se mantienen intactos.
- Procesamiento de textos largos mediante ventanas de hasta 512 tokens con division en espacios en blanco, conservando todos los caracteres de origen.
- Uso sin diccionario en tiempo de ejecucion, sin analizador morfologico y sin dependencia de RUAccent.
- Ejecucion en CPU y CUDA, con soporte de autocast BF16 en GPU.

## Casos de uso

- Preprocesamiento para sintesis de voz (TTS) en ruso: los motores TTS necesitan conocer la posicion del acento para pronunciar correctamente; Accentik puede insertarse como etapa previa en el pipeline para anotar el texto antes de la sintesis.
- Desambiguacion de homografos: palabras como "замок" (cerradura/castillo) cambian de acento segun el significado; el modelo usa el contexto de la frase para decidir, algo que un diccionario estatico no puede hacer.
- Lectura de texto en voz alta (screen readers y asistentes): la acentuacion correcta mejora la naturalidad de la voz sintetica en aplicaciones de accesibilidad para usuarios rusohablantes.
- Generacion de audiolibros y locucion automatizada: el procesamiento por lotes y el manejo de textos largos con ventanas de 512 tokens permiten anotar capitulos completos conservando el formato original.
- Correccion ortografica de `ё`: con `restore_yo=True` se puede restaurar la letra `ё` en textos donde se escribio `е`, util en edicion editorial (aunque con cautela por su caracter experimental).
- Integracion en pipelines de NLP en ruso: la API `annotate` devuelve decisiones por palabra con offsets de caracteres y confianzas, facil de consumir desde otros componentes de procesamiento linguistico.
- Sistemas de chatbot o atencion al cliente con voz en ruso: la acentuacion automatica mejora la calidad de las respuestas habladas sin anadir latencia significativa al ser un modelo de solo 35 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card remite a un fichero evaluation.json en el repositorio con resultados agregados de referencia, procedencia de las etiquetas y regresiones conocidas, y aclara que las puntuaciones sobre dialogos en ruso miden la concordancia con etiquetas generadas por RUAccent.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 140 MB en FP32 para los pesos (el repo completo ocupa 0,3 GB); en CPU funciona sin GPU.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y BF16; dada la minima huella de memoria, no se requiere A100 ni H100. Una RTX 3060 o superior es mas que suficiente.
- Cabe en GPUs de consumo sin problema: incluso las GPUs mas modestas (4 GB de VRAM) lo ejecutan con holgura; tambien es plenamente viable en CPU (se recomienda limitar hilos con `torch.set_num_threads(2)` para evitar sobrecoste).
- Opciones de despliegue: libreria Transformers (>= 5.15.1) con `trust_remote_code=True` y PyTorch (>= 2.6); no requiere llama.cpp, vLLM ni Ollama al ser un encoder de feature-extraction con codigo personalizado.
- Versiones probadas: Python 3.10, PyTorch 2.9.0 y Transformers 5.15.1. Dependencias adicionales: safetensors >= 0.4.3 y numpy >= 1.24.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque la arquitectura de una sola pasada del encoder sin decodificacion autorregresiva sugiere inferencia rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| TeraSpace/accentik | 35,05 M | Acentuacion de ruso + restauracion de `ё` | accentik-openrail-m-public-attribution | Hugging Face, safetensors FP32 |
| RUAccent | no disponible | Acentuacion de ruso (basado en diccionario + modelos) | no disponible | Hugging Face / PyPI |
| deepvk/RuModernBERT-small (base) | 35,05 M (aprox.) | Modelo base encoder para ruso, feature-extraction general | no disponible | Hugging Face |

Nota: RUAccent es el sistema del que provienen las etiquetas de dialogo usadas en el entrenamiento de Accentik; Accentik se posiciona como alternativa que no requiere instalar RUAccent ni diccionarios en tiempo de ejecucion. No hay datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- La restauracion de `ё` es experimental y esta desactivada por defecto: la cabeza de `ё` puede inventar letras (por ejemplo, "висел" → "висёл") u omitir `ё`, especialmente en contextos ambiguos y palabras compuestas.
- Las puntuaciones de confianza son softmax sin calibrar: no representan la probabilidad real de acierto, y subir el umbral `yo_threshold` no garantiza ortografia correcta.
- Las metricas de evaluacion miden concordancia con etiquetas generadas por RUAccent, no con acentuacion humana verificada; los sesgos de RUAccent pueden transferirse al modelo.
- Solo procesa palabras rusas con dos o mas vocales para acentuacion; las palabras monovocalicas solo se evaluan para la prediccion de `ё`.
- Limitado al idioma ruso; el texto en otros idiomas se preserva pero no se procesa.
- La licencia es "other" (accentik-openrail-m-public-attribution): permite uso publico con atribucion segun los terminos OpenRAIL modificados, pero conviene revisar el fichero LICENSE antes de cualquier despliegue comercial.
- Al usar `trust_remote_code=True` se ejecuta codigo personalizado del repositorio; para despliegues reproducibles se recomienda fijar un hash de commit explicito en `revision=`.
- Existen regresiones conocidas documentadas en evaluation.json que conviene consultar antes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TeraSpace/accentik
- Licencia: https://huggingface.co/TeraSpace/accentik/blob/main/LICENSE
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-small
- Resultados de evaluacion: https://huggingface.co/TeraSpace/accentik/blob/main/evaluation.json
