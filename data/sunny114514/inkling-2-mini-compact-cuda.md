# sunny114514/Inkling-2-Mini-Compact-CUDA

## Resumen

Inkling-2-Mini-Compact-CUDA es una cuantización y reempaquetado del modelo Inkling-2-Mini, un transformer de tipo mezcla de expertos (MoE) con 24 capas físicas y 128 expertos por capa. Lo publica el usuario sunny114514 sobre los checkpoints intermedios de shinmegamiboson (variantes LookAtMyQuant de 5,4 GB y 8,9 GB), fusionados en un único checkpoint de 8,35 GB. El objetivo declarado es ejecutar el modelo completo en una GPU de consumo de 12 GB, en concreto una GeForce RTX 3060, sin descartar capas ni expertos.

El interés práctico del artefacto no está en el modelo en sí, sino en el empaquetado: reduce el checkpoint padre de 8,874 GB a 8,350 GB (un 5,91 % menos, 524,5 MB), conserva las 24 capas y los 128 expertos por capa, y se distribuye junto a un runner CUDA propio con un kernel precompilado para SM 8.6 y un verificador de checksums. El autor reporta 147/164 en HumanEval y 192/200 en GSM8K con un presupuesto de 1.536 tokens de salida, en ejecuciones locales emparejadas contra el checkpoint padre.

La ficha se basa exclusivamente en la model card y en los metadatos de Hugging Face. No hay información publicada sobre el entrenamiento original de Inkling-2-Mini, la composición del dataset ni los pesos completos sin cuantizar, por lo que varios campos de especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 24 capas físicas, 128 expertos por capa |
| Parametros totales | no disponible (el autor no publica el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens en el CLI de chat incluido (`--context 4096`); máximo nativo no disponible |
| Tipos de cuantizacion | Pesos empaquetados en formato propietario "packed" con kernel CUDA; cuantización base heredada de LookAtMyQuant (nivel exacto no disponible). K/V cache en FP16 |
| Idiomas soportados | no disponible (la model card está en inglés y chino, pero no declara idiomas del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Packed layer files + `manifest.json` + tokenizer; no safetensors ni GGUF estándar |
| Tamano del checkpoint | 8.349.693.242 bytes (8,35 GB decimales) en 61 archivos de runtime |
| Modelo base | shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB y ...-8.9GB (merge) |
| Requisito de GPU probado | RTX 3060 12 GB (SM 8.6), Windows 10 x64, PyTorch 2.6.0+cu124, driver 560.94 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 24 capas físicas y 128 expertos por capa, según la model card. El checkpoint publicado es una fusión (merge) de dos variantes cuantizadas del modelo base, empaquetada en archivos por capa que un kernel CUDA propio lee directamente en la GPU. No se documenta el mecanismo de enrutamiento de expertos, el número de expertos activos por token, la dimensión de las cabezas de atención ni el tipo de positional encoding.

No hay información disponible sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste de instrucciones. Tampoco se detalla el proceso de cuantización original de LookAtMyQuant más allá de los tamaños de checkpoint. La innovación técnica documentada es de despliegue, no de modelado: empaquetado de pesos con kernel nativo para SM 8.6, verificador SHA-256 y un CLI de chat que mantiene el modelo cargado entre turnos.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia, mantenida en memoria entre turnos por el CLI incluido.
- Razonamiento aritmético: el prompt de prueba del autor ("17 × 23") devuelve 391 de forma correcta; 192/200 en GSM8K con 1.536 tokens de salida.
- Generación de código Python: 147/164 tareas ejecutables de HumanEval en pass@1 con 1.536 tokens.
- Modo de razonamiento desactivable: las evaluaciones se hicieron con `reasoning_effort="none"`, lo que implica que el modelo soporta un modo de razonamiento explícito opcional.
- Decodificación greedy determinista: el autor verifica que 70 secuencias reproducidas coinciden con los prefijos greedy originales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente de código en local para una estación de trabajo con RTX 3060: el modelo genera funciones Python completas (validado en HumanEval) y el runner mantiene el contexto en memoria, de modo que se puede iterar sobre una función sin recargar 8,35 GB de pesos en cada turno.
- Resolución de problemas aritméticos y de razonamiento cuantitativo en entornos sin conectividad: con 192/200 en GSM8K a 1.536 tokens, es adecuado para un tutor o validador de cálculos paso a paso que no puede enviar datos a la nube.
- Chat multi-turno privado en escritorio: el CLI `chat_inkling_cuda.py` con `--context 4096` permite conversaciones de varias rondas con historial en RAM, útil cuando la política de datos prohíbe APIs externas.
- Evaluación comparativa de cuantizaciones: al publicar resultados emparejados contra el checkpoint padre con la misma GPU y plantilla, sirve como referencia para medir la pérdida de calidad de una cuantización MoE frente al original.
- Prototipado de pipelines de generación de texto en Windows: el paquete incluye DLL precompilada, verificador de checksums y comandos reproducibles, lo que reduce el tiempo de puesta en marcha en máquinas de desarrollo con GPU de 12 GB.
- Docencia e investigación sobre MoE en hardware de consumo: permite inspeccionar el comportamiento de un modelo con 128 expertos por capa sin acceso a clústeres, aunque el formato empaquetado limita la instrumentación interna.
- Generación de respuestas con presupuesto de salida acotado: los parámetros `--max-new-tokens` y `reached_limit` permiten controlar coste y latencia por petición en un servicio de baja concurrencia.

## Benchmarks y rendimiento

Datos publicados por el autor, ejecuciones locales emparejadas en RTX 3060 12 GB, plantilla de chat incluida, decodificación greedy, `reasoning_effort="none"`, batch size 2 y K/V en FP16. pass@1 en HumanEval (164 tareas ejecutables) y primeros 200 ítems de GSM8K.

| Checkpoint | Runtime (GB) | GSM8K /200 a 1.024 tok | HumanEval /164 a 1.024 tok | GSM8K /200 a 1.536 tok | HumanEval /164 a 1.536 tok |
|---|---:|---:|---:|---:|---:|
| Compact CUDA expert mix | 8,350 | 191 | 132 | 192 | 147 |
| LookAtMyQuant parent | 8,874 | 191 | 130 | 195 | 145 |

Métricas de runtime del checkpoint compacto en las ejecuciones a 1.024 tokens: pico de asignación PyTorch de 8,329 GiB en GSM8K y 8,380 GiB en HumanEval; throughput agregado de 5,401 y 5,636 tokens/s para dos peticiones simultáneas.

No se han publicado resultados de MMLU, MT-Bench ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~8,4 GiB de pico medido con PyTorch en las ejecuciones de referencia (8,329-8,380 GiB), sobre una GPU de 12 GB.
- GPU probada: NVIDIA GeForce RTX 3060 12 GB (SM 8.6). El kernel se distribuye compilado para SM 8.6; otras arquitecturas requerirían recompilar desde el código fuente CUDA del repositorio.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB y previsiblemente en cualquier GPU con al menos ~9-10 GB libres y compute capability 8.6 (por ejemplo, RTX 3080 12 GB, RTX 4070 Ti).
- Despliegue: runner CUDA propio (`run_inkling_cuda.py`, `chat_inkling_cuda.py`) más DLL `inkling_packed.dll`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos empaquetado no es compatible con esos motores sin conversión.
- Entorno validado: Windows 10 x64, Python 3.12.10, PyTorch 2.6.0+cu124, driver NVIDIA 560.94.
- Latencia y throughput: 5,401-5,636 tokens/s agregados con dos peticiones simultáneas en RTX 3060; no se publica latencia por token ni throughput en single-stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-Compact-CUDA | MoE, 24 capas × 128 expertos (total no disponible) | 4.096 en CLI | 147/164 (1.536 tok) | 192/200 (1.536 tok) | Apache 2.0 | Packed + kernel CUDA propio |
| Inkling-2-Mini-LookAtMyQuant (padre) | igual | no disponible | 145/164 (1.536 tok) | 195/200 (1.536 tok) | Apache 2.0 | Packed, mismo runner |
| Otros modelos de ~8-9 GB con MoE | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada; la única comparación emparejada publicada es contra el checkpoint padre. No se han identificado alternativas de la misma categoría con métricas verificables en esta ficha.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados por el autor.
- Los benchmarks son ejecuciones locales del propio autor, con una única GPU (RTX 3060) y sin repetición con semillas distintas; no son comparables directamente con cifras de pass@1 publicadas en otras condiciones.
- El formato de pesos es propietario (packed + DLL); no es portable a vLLM, llama.cpp, Ollama o TGI sin trabajo de conversión, lo que limita su uso en producción estándar.
- El kernel solo está compilado para SM 8.6; en GPUs Ampere de gama alta (A100, SM 8.0) o Ada/Hopper habría que recompilar el código CUDA.
- La ventana de contexto documentada es de 4.096 tokens en el CLI; se desconoce el máximo nativo del modelo y si soporta extensiones.
- No hay información sobre sesgos, composición del dataset ni filtrado de datos, por lo que el riesgo de alucinación y de sesgos no puede evaluarse.
- No se documentan idiomas soportados; no se debe asumir buen rendimiento en castellano.
- La licencia Apache 2.0 se aplica al artefacto publicado, pero el modelo base y su linaje de cuantización no están detallados; conviene verificar la cadena de licencias antes de uso comercial.
- El autor reporta una pérdida de 3 puntos en GSM8K frente al padre con 1.536 tokens (192 vs 195) y una mejora de 2 en HumanEval (147 vs 145); la cuantización no es neutral en calidad.
- El throughput de ~5,5 tokens/s agregados con dos peticiones es bajo para servicio interactivo; el caso de uso realista es local y de baja concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA
- README en inglés: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA
- README en chino: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA/blob/main/README.zh-CN.md
- Repositorio del runner CUDA: https://github.com/sunnyspot114514/inkling-mini-cuda
- Release con la DLL de Windows: https://github.com/sunnyspot114514/inkling-mini-cuda/releases/tag/v0.1.0
- Resultados emparejados a 1.536 tokens: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA/blob/v0.1.0/evaluation/budget-1536/paired/summary.json
- Resultados por ítem a 1.536 tokens: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA/blob/v0.1.0/evaluation/budget-1536/items.json
- Scorecard a 1.024 tokens: https://huggingface.co/sunny114514/Inkling-2-Mini-Compact-CUDA/blob/v0.1.0/evaluation/scorecard.json
- Modelo base 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Modelo base 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
