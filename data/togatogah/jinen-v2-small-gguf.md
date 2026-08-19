# togatogah/jinen-v2-small.gguf

## Resumen

jinen-v2-small es un modelo de conversión kana-kanji (かな漢字変換) para japonés, desarrollado por Hitoshi Togasaki y publicado bajo el identificador `togatogah/jinen-v2-small.gguf`. Se distribuye en formato GGUF, lo que permite ejecutarlo con llama.cpp y otros motores compatibles sin necesidad de GPU dedicada. Con 109,5 millones de parámetros, es un modelo compacto diseñado específicamente para transformar lecturas fonéticas (kana) en texto kanji, una tarea fundamental en sistemas de entrada de texto japonés (IME).

El modelo es la versión GGUF de jinen-v2-small, cuya versión original en PyTorch también está disponible. Su relevancia radica en que ofrece una alternativa ligera y de código abierto a los IME comerciales, con una precisión competitiva en el benchmark AJIMEE-Bench. Requiere normalización NFKC del prompt y decodificación greedy para obtener resultados óptimos, y emplea tokens especiales en el área privada de Unicode para estructurar la entrada y salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 109.533.696 (109,5 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (benchmark con n_ctx 1024) |
| Tipos de cuantizacion | f16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (safetensors para la version original) |

## Arquitectura y entrenamiento

No se han publicado detalles arquitectonicos especificos en la informacion disponible. Se trata de un modelo de generacion de texto de tamano reducido (109,5 M de parametros) entrenado para la tarea de conversion kana-kanji. El corpus de entrenamiento incluye datos bibliograficos de la Biblioteca Nacional de la Dieta de Japon (国立国会図書館), obtenidos el 9 de julio de 2026, procesados y adaptados por el autor. No se indica si se emplearon tecnicas como RLHF o DPO.

La innovacion principal reside en el protocolo de prompting: se utilizan tres tokens especiales en el area privada de Unicode (`\uee00`, `\uee01`, `\uee02`) para delimitar la lectura de entrada, el inicio de la salida y el contexto izquierdo opcional. El modelo asume entrada normalizada con NFKC, y se recomienda encarecidamente aplicar esta normalizacion tanto al prompt como a la referencia para mantener la precision.

## Capacidades

- Conversion kana-kanji: transforma lecturas en hiragana/katakana a texto kanji correcto.
- Soporte de contexto izquierdo: permite incluir hasta 64 caracteres de contexto previo para mejorar la desambiguacion.
- Generacion greedy: disenado para funcionar con decodificacion determinista (`--temp 0 --top-k 1`).
- Multilingue: no, exclusivamente japones.
- Tool calling, agentes, vision, audio: no soportados.

## Casos de uso

- Sistema de entrada de texto (IME) para japones: el modelo puede integrarse en aplicaciones de escritorio o web como motor de conversion kana-kanji, sustituyendo o complementando a los IME tradicionales. Su tamano reducido permite ejecutarlo localmente sin latencia perceptible.
- Correccion ortografica de textos japoneses: dado un texto con errores de kanji, se puede reconstruir la lectura fonetica y volver a convertir, aprovechando el contexto izquierdo para elegir la forma correcta.
- Procesamiento de datos bibliograficos: el modelo se entreno con datos de la Biblioteca Nacional de la Dieta, por lo que es adecuado para normalizar titulos, autores y materias en registros catalograficos.
- Asistente de escritura para estudiantes de japones: puede usarse como herramienta pedagogica para mostrar conversiones correctas a partir de lecturas proporcionadas por el usuario.
- Preprocesamiento en pipelines de NLP: como paso previo a tareas de analisis morfologico o traduccion, convirtiendo kana ambiguo en kanji canónico.
- Pruebas de concepto en entornos embebidos: al caber en menos de 100 MB cuantizado, puede desplegarse en dispositivos con recursos limitados, como Raspberry Pi o moviles, via llama.cpp.

## Benchmarks y rendimiento

Resultados en AJIMEE-Bench (conjunto `JWTD_v2/v1`, 200 preguntas, decodificacion greedy, llama.cpp b10200, CPU 4 hilos, `n_ctx 1024`, contexto izquierdo de 64 caracteres):

| Archivo | Tamano | Accuracy@1 | Accuracy@1 (NFKC) | p50 | p90 | p99 |
|---|---:|---:|---:|---:|---:|---:|
| `jinen-v2-small-f16.gguf` | 220 MB | 80,0 % | 86,0 % | 61 ms | 147 ms | 233 ms |
| `jinen-v2-small-Q8_0.gguf` | 117 MB | 80,5 % | 86,5 % | 44 ms | 100 ms | 146 ms |
| `jinen-v2-small-Q5_K_M.gguf` | 81 MB | 80,0 % | 86,0 % | 48 ms | 111 ms | 171 ms |
| `jinen-v2-small-Q4_K_M.gguf` | 72 MB | 79,5 % | 85,5 % | 38 ms | 86 ms | 131 ms |

La version original en PyTorch alcanza exact 80,5 % y 86,5 % con NFKC. Las latencias corresponden a CPU con 4 hilos; en GPU serian menores.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para cualquier cuantizacion (el archivo mas grande, f16, ocupa 220 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, aunque no es necesaria; el modelo esta pensado para CPU.
- Compatibilidad con GPU de consumo: total, incluyendo GTX 1050, RTX 3060, etc.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (si se convierte el GGUF), TGI (con adaptacion), o el backend de Hugging Face.
- Latencia: en CPU con 4 hilos, p50 entre 38 y 61 ms segun cuantizacion; en GPU seria inferior a 10 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (AJIMEE) | Licencia | Formato |
|---|---|---|---|---|---|
| jinen-v2-small (este) | 109,5 M | no disp. | 80,5 % (exact) / 86,5 % (NFKC) | CC BY-SA 4.0 | GGUF, safetensors |
| jinen-v1-small | no disp. | no disp. | no disp. | CC BY-SA 4.0 (presumible) | GGUF, safetensors |

No se dispone de otros modelos comparables de conversion kana-kanji con benchmarks publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere normalizacion NFKC del prompt; omitirla degrada significativamente la precision.
- Los tokens especiales son caracteres invisibles en el area privada de Unicode; deben escribirse con escapes ASCII para evitar que se pierdan en ciertos canales de transmision.
- Solo funciona con decodificacion greedy; usar sampling aleatorio produce resultados incorrectos.
- Limitado a japones; no soporta otros idiomas.
- Licencia CC BY-SA 4.0: obliga a compartir derivados bajo la misma licencia y a atribuir al autor; verificar compatibilidad con proyectos propietarios.
- Riesgo de alucinacion en contextos fuera del dominio bibliografico de entrenamiento.
- No hay garantias de exactitud en textos especializados o argot.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/togatogah/jinen-v2-small.gguf
- Version original PyTorch (referenciada): https://huggingface.co/togatogah/jinen-v2-small
- Modelo anterior jinen-v1-small: https://huggingface.co/togatogah/jinen-v1-small
- Benchmark AJIMEE-Bench: https://github.com/azooKey/AJIMEE-Bench
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/deed.ja
