# trevest/Qwen3.8-27B-Tetris-GGUF

## Resumen

Qwen3.8-27B Tetris es una cuantizacion GGUF del modelo Qwen/Qwen3.8-27B, creada por el usuario trevest y publicada en HuggingFace. Se trata de un modelo de lenguaje y vision (VLM) de 27.320 millones de parametros con una ventana de contexto de 163.840 tokens, disenada especificamente para caber en una GPU de 24 GB de VRAM, como la RTX 5090 Mobile. La cuantizacion emplea una mezcla por tensor con precision variable por capas (depth-banded per-tensor precision) que asigna mas bits a las partes de la arquitectura que mas los necesitan, como las proyecciones K/V de atencion completa o las compuertas de decaimiento del bloque Gated-DeltaNet.

El resultado es un archivo GGUF de 14.03 GiB a 4.41 bpw que, segun las mediciones del autor, mantiene una perplejidad held-out de 7.1453 frente al 6.9887 de la referencia Q8_0 (+2.24%), y que ha sido verificado en servidor con llama.cpp sobre una RTX 5090 Mobile a contexto completo sin errores de memoria. Incluye ademas una importance matrix ponderada hacia codigo y tool-calling, y un archivo de receta que permite reproducir la cuantizacion. Su relevancia radica en demostrar que es posible ejecutar un VLM de 27B con contexto ultralargo en hardware de consumo, algo que hasta ahora requeria GPUs de mayor capacidad o cuantizaciones mas agresivas con peor calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + full attention (con capa MTP de prediccion multi-token) |
| Parametros totales | 27.320.697.856 (27.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 163.840 tokens (verificado en servidor; 180.224 con margen reducido) |
| Tipos de cuantizacion | 4.41 bpw per-tensor mix (Tetris); tambien se mencionan Q8_0 y UD-Q4_K_XL como referencias |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingue, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida que combina atencion completa (full attention) en 16 de sus capas con bloques Gated-DeltaNet (GDN), una variante de redes de estado (SSM) con compuertas de decaimiento aprendidas. Esta combinacion permite manejar secuencias muy largas (163.840 tokens) con un coste computacional menor que un transformer puro. Ademas, el checkpoint incluye una capa MTP (multi-token prediction) que actua como cabeza de borrador para decodificacion especulativa, acelerando la generacion.

La cuantizacion Tetris no es un entrenamiento nuevo, sino una conversion del checkpoint BF16 original (convertido por unsloth) mediante llama.cpp. El autor aplico una importance matrix calculada con un 40% de datos de bartowski datav3, 48% de codigo real y 12% de transcripciones de tool-calling en formato ChatML, usando `--parse-special`. La asignacion de bits por tensor se hizo de forma manual: las capas FFN se dividen en bandas de profundidad (capas superficiales y finales con mas bits, capas intermedias con menos), las proyecciones K/V de atencion completa se mantienen en q8_0, las compuertas ssm_alpha y ssm_beta en F32, y la capa MTP completa en q6_k. No se menciona el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo de 27B, ofrece capacidades de comprension y generacion de lenguaje natural, aunque no se aportan benchmarks especificos en la informacion disponible.
- Vision (VLM): el modelo base es un modelo de lenguaje y vision; la cuantizacion requiere el archivo `mmproj-F16.gguf` de unsloth para el proyector de imagen.
- Codigo y tool calling: la importance matrix esta ponderada hacia codigo y transcripciones de tool-calling, lo que sugiere un rendimiento optimizado en generacion de codigo y llamadas a funciones.
- Contexto ultralargo: soporta hasta 163.840 tokens de contexto, verificado en servidor con una prompt de 110.697 tokens.
- Decodificacion especulativa: incluye la capa MTP como borrador, con un parametro recomendado `--spec-draft-n-max 3` que alcanza 74.8 t/s de media en la GPU objetivo.
- Multilingue: no se especifican idiomas concretos, pero el modelo base Qwen3.8 es conocido por su soporte multilingue.

## Casos de uso

- Asistentes de codigo en entornos con GPU limitada: un desarrollador con una RTX 5090 (24 GB) puede ejecutar este modelo localmente para autocompletar codigo, refactorizar o explicar fragmentos, gracias a la importance matrix orientada a codigo y al soporte de tool calling.
- Analisis de documentos largos con vision: al ser un VLM con 163.840 tokens de contexto, puede procesar documentos extensos (contratos, informes, papers) junto con imagenes o diagramas, sin necesidad de dividir el texto en fragmentos.
- Agentes conversacionales con memoria extendida: el contexto ultralargo permite mantener historiales de conversacion muy amplios, adecuado para chatbots de soporte o asistentes personales que necesitan recordar interacciones previas durante horas.
- Generacion de codigo en pipelines de CI/CD: con tool calling y capacidades de razonamiento, puede integrarse en flujos automatizados para generar tests, documentacion o parches, ejecutandose en una workstation con GPU de 24 GB.
- Investigacion academica en procesamiento de lenguaje natural: investigadores que necesiten probar modelos de 27B con contexto largo en hardware de consumo pueden usar esta cuantizacion para experimentos de extraccion de informacion, resumen o analisis de corpus extensos.
- Despliegue en edge computing con GPU movil: el modelo esta verificado en una RTX 5090 Mobile (portatil), lo que lo hace util para aplicaciones de inferencia en estaciones de trabajo moviles o servidores compactos con limitaciones de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones propias de perplejidad held-out y rendimiento de servidor:

| Metrica | Valor |
|---|---|
| Perplejidad held-out (120x512 tokens, wikitext-2-test + codigo) | 7.1453 |
| Perplejidad Q8_0 de referencia | 6.9887 |
| Diferencia vs Q8_0 | +2.24% |
| Prefill (prompt de 110.697 tokens) | 833 t/s |
| Generacion (con MTP, n-max 3) | 74.8 t/s media (65.7 t/s en prosa, 75.5 t/s en codigo) |
| Tasa de aceptacion del borrador MTP | 0.704 (con n-max 3) |
| VRAM en inferencia (ctx 163840, q8_0 KV) | 23.038 MiB |

Estas cifras se midieron con llama.cpp b10448 en una RTX 5090 Mobile (24 GB) con `--spec-type draft-mtp` y cache KV en q8_0.

## Requisitos de hardware

- VRAM estimada: 23.038 MiB (22.5 GiB) con contexto 163.840 y cache KV q8_0, segun la verificacion del autor. Con contexto 180.224 deja unos 90 MiB de margen, por lo que no se recomienda.
- GPU recomendada: RTX 5090 Mobile (24 GB) verificada; cualquier GPU con 24 GB de VRAM (RTX 4090, A5000, etc.) deberia ser compatible. No cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: llama.cpp y llama-server (usando `--spec-type draft-mtp` para decodificacion especulativa). No se mencionan vLLM, Ollama o TGI en la informacion.
- Latencia y throughput: prefill de 833 t/s y generacion de 65-75 t/s dependiendo del tipo de texto, medidos en la GPU objetivo.
- Nota importante: el autor advierte que el espacio de trabajo del grafo MTP se asigna en la primera peticion, por lo que hay que verificar el contexto con una completacion real, no con un health check.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (VLM de 27B con contexto ultralargo) en la informacion proporcionada. Como referencia interna, el autor compara su cuantizacion con otras dos del mismo modelo base:

| Cuantizacion | Tamano | bpw | Perplejidad held-out | Diferencia vs Q8_0 |
|---|---|---|---|---|
| Q8_0 (referencia) | 27.05 GiB | 8.50 | 6.9887 | — |
| unsloth UD-Q4_K_XL | 16.69 GiB | 5.24 | 7.0057 | +0.24% |
| Tetris (este repo) | 14.03 GiB | 4.41 | 7.1453 | +2.24% |

La ventaja de Tetris es que reduce el tamano en 2.66 GiB respecto a UD-Q4_K_XL con solo un 2% adicional de perplejidad, lo que permite el contexto completo en 24 GB.

## Limitaciones y advertencias

- La cuantizacion a 4.41 bpw introduce una perdida de calidad del +2.24% en perplejidad frente a Q8_0, que puede traducirse en respuestas ligeramente menos precisas o mas alucinaciones en tareas complejas.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.), por lo que no es posible evaluar su rendimiento en tareas especificas frente a otros modelos.
- El contexto de 180.224 tokens deja un margen de VRAM muy ajustado (90 MiB) y no se recomienda para uso en produccion; el autor solo garantiza 163.840 tokens.
- La capa MTP es sensible a la cuantizacion: el autor observo que la tasa de aceptacion del borrador cae ~4 puntos porcentuales frente a la cuantizacion UD-Q4_K_XL, por lo que hay que usar `--spec-draft-n-max 3` en lugar del valor por defecto.
- No se especifican los idiomas soportados ni posibles sesgos del modelo base; al ser una cuantizacion, hereda las limitaciones del Qwen3.8-27B original.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.
- El archivo `mmproj` (proyector de vision) no esta incluido en este repositorio; hay que descargarlo por separado desde unsloth/Qwen3.8-27B-GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trevest/Qwen3.8-27B-Tetris-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyector de vision (mmproj): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
