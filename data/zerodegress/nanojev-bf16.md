# ZeroDegress/NanoJev-bf16

## Resumen

NanoJev-bf16 es una conversión de precisión del checkpoint raíz de C-Tianyu/NanoJev, un modelo de decisión de tipo "nano replica" del sistema Jev System One de TypeSafe. No es un modelo nuevo ni un ajuste fino: todos los tensores del checkpoint original en fp32 se han convertido a bfloat16 y el resto de ficheros (config.json, backbone_config/, tokenizer/) son copias byte a byte del repositorio original. El autor del artefacto es el usuario ZeroDegress y el modelo base declarado es C-Tianyu/NanoJev.

El modelo subyacente usa un backbone Qwen3-0.6B (28 capas, dimensión oculta de 1024) con cabezas de decisión estructuradas, sumando 596 millones de parámetros. En lugar de generar texto token a token, devuelve distribuciones de probabilidad completas sobre candidatos dinámicos: `choice` (entre 2 y 255 opciones), `boolean` y `score` (entre 2 y 10 niveles), todo ello en un único forward batchado del backbone y con cero decodificación de tokens de salida.

Su relevancia es doble. Por un lado, es un ejemplo práctico de conversión de precisión frente a cuantización: bfloat16 es un formato de coma flotante y no almacena factores de escala ni puntos cero. Por otro, el autor documenta con detalle el efecto medible de la conversión sobre el acuerdo de argmax y las distancias de distribución, además de advertir de que el checkpoint upstream solo trae un punto de entrada de inferencia para CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3-0.6B y cabezas de decisión estructuradas (modelo de decisión, no generativo por tokens) |
| Parametros totales | 596 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | bfloat16 (conversion de precision fp32 -> bf16); no incluye int8, 4-bit ni formatos GGUF |
| Idiomas soportados | no disponible (tokenizer heredado del backbone Qwen3-0.6B) |
| Licencia | no disponible; la pagina upstream no declara licencia y este repositorio tampoco reclama ninguna, por lo que los derechos quedan sin resolver |
| Formato de pesos | safetensors (best.safetensors, bf16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer backbone Qwen3-0.6B con 28 capas y dimensión oculta de 1024, sobre el que se montan cabezas de decisión que proyectan la representación del backbone a distribuciones de probabilidad sobre un conjunto dinámico de candidatos. El modelo no decodifica tokens: con un solo forward batchado del backbone resuelve preguntas de tipo `choice` (2 a 255 opciones), `boolean` y `score` (2 a 10 niveles). El checkpoint upstream procede de la ejecución `v3_teacher_coords_multi_seed17`, con objetivo `teacher`, vista `coords_multi` y best_step 1200 (sha256 `fff62d1412685c1714eaa386acb603f9690371fb3cc8ad03dc41319302597c28`).

En este repositorio no hubo entrenamiento alguno: no se actualizó ni un solo peso. La única transformación fue el casting fp32 → bfloat16 de todos los tensores, sin datos de calibración ni factores de escala. Los ficheros de configuración y tokenizer se copiaron byte a byte del upstream, y el peso resultante ocupa 1.192.538.284 bytes frente a los 2.385.039.280 bytes del original en fp32 (el 50,0 %). El cargador upstream (`scripts/predict_toy_decisions.py`) construye el modelo en fp32 y llama a `load_state_dict(strict=True)`, de modo que este fichero carga sin ningún cambio de código, ya que los pesos se reescalan a fp32 al cargar.

## Capacidades

- Predicción de decisiones sobre candidatos dinámicos: devuelve una distribución de probabilidad completa sobre 2 a 255 opciones (`choice`), sobre verdadero/falso (`boolean`) y sobre 2 a 10 niveles (`score`).
- Inferencia en un único forward del backbone, sin decodificación autorregresiva de tokens de salida.
- Compatibilidad directa (drop-in) con el cargador upstream en fp32 mediante `load_state_dict(strict=True)`.
- Reproducción de las distribuciones del checkpoint fp32: 48/48 coincidencias de argmax en 16 estados de desarrollo congelados (48 preguntas) y distancia de variación total media de 1,6e-4.
- No se documentan capacidades de generación de texto, razonamiento libre, código, matemáticas, visión, audio, tool calling, function calling ni uso como agente. La model card no las menciona en ningún punto.

## Casos de uso

- Sustitución de almacenamiento del checkpoint fp32: usar el fichero bf16 como formato en disco y cargarlo en fp32 para cómputo, reduciendo a la mitad el espacio en disco y el uso de memoria sin cambios en los números de salida (el propio autor lo recomienda explícitamente en CPU).
- Despliegue en GPU con CUDA: ejecutar el punto de entrada upstream tal cual, ya que el fichero bf16 carga sin modificaciones y los pesos se reescalan a fp32 al cargar.
- Evaluación y auditoría de modelos de decisión: al conservar las mismas cabezas y tokenizer, sirve para reproducir las métricas del run `v3_teacher_coords_multi_seed17` (CE contra objetivos teacher y gold) con un artefacto más ligero.
- Experimentación en Apple Silicon: requiere un parche en el punto de entrada (aceptar `mps`/`cpu` y castear pesos en lugar de depender de autocast), y una vez aplicado ofrece 82,4 ms/path en MPS con cómputo bf16 frente a 90,5 ms/path en fp32 (un 9 % más rápido) sobre un M4.
- Pruebas de integración de sistemas de decisión: para validar pipelines que consumen distribuciones sobre candidatos variables (encuestas, clasificación con niveles ordinales, decisiones booleanas) sin necesidad de un modelo generativo.
- Investigación sobre conversión de precisión: caso de estudio reproducible para medir el impacto de fp32 → bf16 sobre acuerdo de argmax, distancia de variación total y KL, con cifras publicadas sobre un split congelado.
- Base para una futura conversión a otros formatos: el repositorio deja claro que la cuantización a int8 o 4-bit (estilo GGUF) es un ejercicio separado y no está incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La model card sí documenta métricas de fidelidad de la conversión sobre el split congelado `stage2/dev.jsonl` (120 estados, 360 preguntas, 898 rutas de candidatos):

| Metrica | fp32 (upstream) | bf16 (este repo) | Delta |
|---|---|---|---|
| Acuerdo de argmax global | referencia | 99,72 % | -0,28 pp |
| Acuerdo de argmax, boolean | referencia | 100 % | 0 |
| Acuerdo de argmax, score | referencia | 100 % | 0 |
| Acuerdo de argmax, choice | referencia | 99,17 % | -0,83 pp |
| Distancia de variacion total media | referencia | 8,9e-4 | no disponible |
| KL media (ambas direcciones) | referencia | aprox. 5e-6 | no disponible |
| CE contra objetivo teacher | 0,499212 | 0,499243 | +0,00003 |
| CE contra objetivo gold | 0,606506 | 0,606342 | -0,000164 |

El autor valida el arnés de evaluación contra la cifra publicada upstream (`best_dev_target_ce` = 0,4991) obteniendo CE 0,499212 en su reproducción fp32, con las mismas 357/360 preguntas elegibles. En el subconjunto de 16 estados congelados (48 preguntas), el acuerdo de argmax es 48/48 y la distancia de variación total media entre distribuciones es 1,6e-4.

## Requisitos de hardware

- VRAM estimada: los pesos bf16 ocupan unos 1,19 GB en disco, pero el cargador upstream los reescala a fp32, por lo que la inferencia en GPU trabaja con aproximadamente 2,4 GB de pesos más activaciones y caché; en la práctica cabría en torno a 3 GB de VRAM.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojarlo; no hay cifras publicadas para A100, H100 ni RTX 4090.
- Compatibilidad con GPU consumer: sí, por el tamaño de 596 M de parámetros es esperable que quepa en tarjetas como RTX 3060, RTX 4060 o superiores, aunque el autor no aporta mediciones en CUDA.
- Opciones de despliegue: el upstream solo incluye un punto de entrada de inferencia para CUDA (`scripts/predict_toy_decisions.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; tampoco tendría sentido con decodificación por tokens, ya que el modelo no genera secuencias.
- Latencia y throughput medidos (Apple M4, macOS, torch 2.14.0): MPS con cómputo bf16, 82,4 ms/path frente a 90,5 ms/path en fp32 (un 9 % mejor). CPU con cómputo bf16, 1511,6 ms/path frente a 134,8 ms/path en fp32 (unas 11 veces más lento, porque Apple silicon no tiene ruta vectorial nativa para bf16 y las matmuls se emulan). No hay datos de latencia en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Naturaleza | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroDegress/NanoJev-bf16 | 596 M | Conversion de precision del checkpoint raiz de NanoJev | bfloat16 (fp32 -> bf16) | no declarada | HuggingFace |
| C-Tianyu/NanoJev (upstream) | 596 M | Modelo de decision original (replica nano de Jev System One) | fp32 | no declarada en la pagina upstream | HuggingFace |
| Jev System One (TypeSafe) | no disponible | Sistema de decision de referencia del que NanoJev es una replica nano | no disponible | no disponible | no disponible (el autor declara no estar afiliado a TypeSafe ni a Jev) |

No se han encontrado en la busqueda web modelos comparables adicionales de la misma categoria (modelos de decision con cabezas de distribucion sobre candidatos dinamicos). Las alternativas mas cercanas serian el checkpoint fp32 upstream y el sistema propietario de referencia.

## Limitaciones y advertencias

- Licencia sin resolver: la pagina upstream no declara campo de licencia y este repositorio tampoco reclama ninguna. El uso comercial queda por tanto en una situacion juridica ambigua; hay que consultar al upstream antes de cualquier uso productivo.
- No es un modelo generativo ni conversacional: devuelve distribuciones sobre candidatos, no texto libre; no sirve como chatbot ni para tareas de generacion.
- El repositorio es una conversion de precision, no un modelo nuevo: no hubo entrenamiento ni ajuste fino, por lo que hereda cualquier sesgo o limitacion del checkpoint upstream.
- Sesgos conocidos: no disponibles en la model card.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero si existe riesgo de calibracion incorrecta de las distribuciones emitidas; no se documentan garantias al respecto.
- Limitaciones de idioma: no se especifica que idiomas soporta; el tokenizer se hereda del backbone Qwen3-0.6B sin confirmacion por parte del autor.
- Limitaciones de contexto: no se publica la longitud de contexto soportada.
- Rendimiento en CPU degradado: con computo bf16 en Apple silicon la inferencia es unas 11 veces mas lenta que en fp32 por emulacion de matmuls; el autor recomienda usar el fichero bf16 solo como formato de almacenamiento y calcular en fp32.
- Punto de entrada solo para CUDA: ejecutar en Apple silicon o CPU requiere un parche manual del script upstream (aceptar `mps`/`cpu` y castear los pesos en lugar de usar autocast).
- Compatibilidad de cuantizacion: el repositorio no contiene pesos int8, 4-bit ni GGUF; quien necesite esos formatos tendra que generarlos por su cuenta.
- Sin afiliacion: el artefacto no esta afiliado a TypeSafe ni a Jev.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZeroDegress/NanoJev-bf16
- Modelo base upstream: https://huggingface.co/C-Tianyu/NanoJev
- Codigo upstream (licencia MIT): https://github.com/TianyuCodings/NanoJev
- Dataset upstream: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los resultados obtenidos correspondian a productos de ceramica sanitaria ajenos por completo al tema.
