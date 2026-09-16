# vtava/SmolLM2-135M-CeNN-Partition-V3

## Resumen

SmolLM2-135M-CeNN-Partition-V3 es un checkpoint de investigacion publicado por el usuario vtava que parte del modelo base HuggingFaceTB/SmolLM2-135M (135 millones de parametros) y sustituye la atencion de dos capas concretas (indices 0 y 29) por un mecanismo de memoria recurrente denominado TinyCeNN, integrado mediante la variante `cenn_partition`. Se trata de un hibrido parcial: el resto de capas conservan atencion estandar, de modo que no es un modelo totalmente libre de atencion, sino un experimento controlado sobre un subconjunto de capas.

La propuesta busca comprimir la cache KV y explorar si un modulo de memoria recurrente de dimension de caracteristicas muy reducida (64, con block size 32 y 4 sink tokens) puede mantener la perplejidad del modelo original. El checkpoint anade unicamente 124.050 parametros entrenables sobre el modelo base, lo que lo convierte en una modificacion de bajo coste computacional respecto al ajuste completo.

El interes actual radica en la linea de investigacion de arquitecturas hibridas y eficientes en memoria para modelos pequenos. Los resultados publicados muestran una reduccion de la cache de aproximadamente el 6 por ciento a 2048 tokens y una perplejidad practicamente identica a la del modelo original, aunque con una penalizacion de velocidad en los kernels de PyTorch actuales, que el propio autor califica de experimentales y no optimizados frente a SDPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida parcial: atencion estandar en la mayoria de capas, con capas 0 y 29 sustituidas por memoria recurrente TinyCeNN (variante `cenn_partition`) |
| Parametros totales | 135 millones (modelo base SmolLM2-135M) mas 124.050 parametros entrenables de TinyCeNN |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la evaluacion publicada cubre contextos de 256 a 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (modelo base y checkpoint); el codigo fuente TinyCeNN-LM es MIT |
| Formato de pesos | no disponible de forma explicita; repositorio de Transformers con carga mediante script `load_model.py` |

## Arquitectura y entrenamiento

El checkpoint parte del modelo SmolLM2-135M en su revision exacta `93efa2f097d58c2a74874c7e644dbc9b0cee75a2` y aplica la variante `cenn_partition` sobre las capas de atencion con indices 0 y 29. El modulo TinyCeNN se configura con una dimension de caracteristicas de 64, un block size de 32 y 4 sink tokens. El codigo fuente procede del repositorio TinyCeNN-LM en el commit `0efdb79575204e9f02624ef64e0e6286076ab227`. Al tratarse de una particion, las capas restantes mantienen atencion Transformer estandar, por lo que el modelo conserva parte del comportamiento del original.

El entrenamiento se realizo en precision bfloat16 y se articula en torno a 300 actualizaciones conjuntas (`joint updates`) que solo afectan a los 124.050 parametros de TinyCeNN. La NLL de validacion final es de 2,8096204151709876, frente a 2,815813680489858 antes de las actualizaciones conjuntas. Segun la model card, los kernels CeNN en PyTorch son experimentales y no estan optimizados al nivel de la atencion SDPA de GPU, lo que explica las cifras de velocidad por debajo de 1,0.

## Capacidades

- Generacion de texto en ingles mediante el pipeline de `text-generation`.
- Razonamiento y generacion propios del modelo base SmolLM2-135M, condicionados por el tamano reducido del modelo.
- Memoria recurrente parcial: dos capas sustituidas por TinyCeNN que actuan como memoria de estado recurrente, lo que puede favorecer la coherencia en secuencias largas.
- Carga como modelo de Transformers mediante un script personalizado (`load_model.py`), no mediante `AutoModel` estandar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion en arquitecturas hibridas: el checkpoint sirve como banco de pruebas para medir el efecto de sustituir capas de atencion por memoria recurrente, comparando la ratio de perplejidad frente al modelo original en contextos de 256 a 2048 tokens.
- Estudio de eficiencia de cache KV: util para analizar la reduccion de memoria (ratio de cache de 0,9857 a 256 tokens hasta 0,9399 a 2048 tokens) en entornos con restricciones severas de VRAM.
- Prototipado educativo: su tamano de 135 millones de parametros permite ejecutar experimentos de generacion de texto de forma rapida en hardware de gama baja o incluso en CPU.
- Generacion de texto ligera en ingles: tareas de completado, resumen breve o redaccion asistida donde no se requiera alta calidad y prime el bajo coste.
- Punto de partida para fine-tuning de bajo rango: dado que el checkpoint introduce un modulo pequeno y aislado, es un candidato para experimentos de ajuste que solo modifiquen la memoria recurrente.
- Validacion de reproducibilidad de pipelines personalizados: sirve para verificar integraciones que requieran cargar modelos con codigo propio (`snapshot_download` mas insercion de ruta en `sys.path`) en lugar del flujo estandar de Transformers.
- Benchmarking de kernels: permite comparar el rendimiento de los kernels CeNN en PyTorch frente a la atencion SDPA en GPU, con las cifras de prefill y decodificacion publicadas.

## Benchmarks y rendimiento

La model card publica una evaluacion held-out con las siguientes cifras. Las ratios inferiores a 1,0 son mejores para perplejidad y cache; valores de speedup por encima de 1,0 indican mayor velocidad.

| Contexto | Perplejidad | Ratio PPL vs original | Ratio de cache | Speedup prefill | Speedup decode |
|---:|---:|---:|---:|---:|---:|
| 256 | 16,421 | 0,9993 | 0,9857 | 0,830x | 0,893x |
| 512 | 14,900 | 1,0021 | 0,9595 | 0,849x | 0,910x |
| 1024 | 14,348 | 1,0034 | 0,9464 | 0,829x | 0,892x |
| 2048 | 14,690 | 1,0093 | 0,9399 | 0,830x | 0,891x |

Datos adicionales de reproducibilidad: NLL de validacion de 2,8096204151709876, NLL antes del ajuste conjunto de 2,815813680489858, 300 actualizaciones conjuntas y 124.050 parametros entrenables de TinyCeNN en bfloat16. No se publican resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 millones de parametros ocupa aproximadamente 270 MB en bf16 y en torno a 135 MB en int8, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090, una RTX 3060 o incluso una GPU integrada pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: la carga requiere un script personalizado (`load_model.py`) y la insercion de la carpeta del repositorio en `sys.path`, por lo que el modelo no se carga con `AutoModel` estandar. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que depende de kernels CeNN personalizados.
- Latencia y throughput: los speedups publicados son inferiores a 1,0 (prefill de 0,829x a 0,849x y decode de 0,891x a 0,910x), es decir, el checkpoint es mas lento que el modelo original con los kernels actuales. No se proporcionan valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM2-135M-CeNN-Partition-V3 | 135 M mas 124.050 de TinyCeNN | no disponible (evaluado hasta 2048) | apache-2.0 | Hibrido parcial con memoria recurrente; requiere kernels personalizados |
| HuggingFaceTB/SmolLM2-135M | 135 M | no disponible | apache-2.0 | Modelo base sin modificaciones; punto de referencia de la evaluacion |
| SmolLM2-360M | 360 M | no disponible | apache-2.0 | Version mayor de la misma familia, sin modificaciones de arquitectura |
| Qwen2.5-0.5B | 0,5 B | no disponible | apache-2.0 | Alternativa de mayor tamano en la misma categoria de modelos pequenos |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La evaluacion se realizo sobre un conjunto held-out limitado y con una unica semilla de entrenamiento, segun reconoce el propio autor.
- El modelo no establece superioridad universal sobre la atencion Transformer estandar; los resultados son especificos de este experimento.
- Las generaciones cualitativas no se consideran evidencia de benchmark, tal como advierte la model card.
- Los kernels CeNN en PyTorch son experimentales y no estan optimizados como la atencion SDPA, lo que provoca una penalizacion de velocidad (speedups de aproximadamente 0,83x en prefill y 0,89x en decode).
- Riesgo de alucinacion: inherente a un modelo de 135 millones de parametros con conocimiento limitado; no se documentan medidas especificas de mitigacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de SmolLM2-135M, hereda los sesgos de su dataset de entrenamiento.
- Limitaciones de idioma: solo se declara soporte de ingles.
- Limitaciones de contexto: la evaluacion publicada alcanza los 2048 tokens; no se especifica el comportamiento mas alla de esa longitud.
- Restricciones de licencia: el checkpoint y el modelo base son apache-2.0, por lo que el uso comercial esta permitido; el codigo fuente TinyCeNN-LM es MIT. Se incluye una copia de licencia como `LICENSE-TinyCeNN-LM`.
- Caveat para produccion: la carga requiere codigo personalizado y kernels especificos, lo que complica su integracion en servidores de inferencia estandar.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que indica una adopcion practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/SmolLM2-135M-CeNN-Partition-V3
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
