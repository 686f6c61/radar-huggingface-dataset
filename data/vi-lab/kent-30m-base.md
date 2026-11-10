# Vi-LAB/KenT-30M-Base

## Resumen

KenT-30M-Base es un modelo de lenguaje recurrente de aproximadamente 30 millones de parametros desarrollado por Vi-LAB. Se trata de un modelo base (no instruido) entrenado desde cero, disenado para explorar una arquitectura alternativa a los transformers clasicos: en lugar de atencion cuadratica, combina una transformada discreta del coseno (DCT-II) fija con una memoria de olvido aprendido tipo EMA (media movil exponencial), lo que da lugar a un procesamiento de tiempo lineal respecto a la longitud de la secuencia.

La arquitectura apila 24 capas identicas. Cada capa proyecta el flujo de representacion a `M` posiciones de resolucion (12 x 96), mezcla esas posiciones con una DCT-II fija, aplica una SwiGLU sobre el eje de caracteristicas y mantiene un estado de memoria recurrente con un coeficiente de decaimiento aprendido por cada posicion de resolucion. El modelo tiene un tamano de oculto de 256, embeddings atados con el `lm_head` y un vocabulario de 50 257 tokens.

Es relevante ahora por su caracter de investigacion: propone una via de tiempo lineal para generacion de texto con un coste computacional muy bajo y un manejo de documentos largos mediante procesamiento por trozos con fusion equivalente al procesamiento secuencial. Esta pensado como modelo de investigacion y debe evaluarse antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente con mezcla DCT-II fija y memoria EMA aprendida (24 capas identicas) |
| Parametros totales | ~29,7 M (embedding 12,9 M + capas 16,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (soporta procesamiento por trozos de 1024 tokens con fusion equivalente al secuencial) |
| Tipos de cuantizacion | pesos en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigo `trust_remote_code` (FP16) |

## Arquitectura y entrenamiento

KenT es un modelo recurrente de tiempo lineal. Cada capa sigue el esquema: proyeccion de entrada `ResProj_in(Norm(X))` que expande de `n` a `M x d`; un bloque WNN que suma `SwiGLU(DCT_M(RMSNorm(Z)))`, donde la DCT-II se aplica de forma fija sobre el eje de resolucion `M` y la SwiGLU sobre el eje de caracteristicas `d`; una actualizacion de memoria EMA `H_t = (1 - a) * H_{t-1} + a * Z_t` con un vector `a` de `M` coeficientes aprendidos por capa; y una proyeccion de salida `ResProj_out(Norm(H_t))` que devuelve de `M x d` a `n`. Los hiperparametros son: oculto `n = 256`, 24 capas, resolucion `M x d = 12 x 96` (M·d = 1152 = 4,5n), SwiGLU oculto de 384 (4d) y vocabulario de 50 257 tokens con embeddings atados.

Los datos de entrenamiento declarados son `wikimedia/wikipedia` y `HuggingFaceFW/fineweb-edu`. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. El modelo se presenta como entrenado desde cero y de tipo base. La innovacion tecnica destacable es el uso de una DCT-II fija como mecanismo de mezcla entre posiciones de resolucion, junto con la memoria EMA con decaimiento aprendido, lo que evita la atencion cuadratica y permite procesar documentos largos por trozos en paralelo con fusion mediante un escaneo afin cuyo resultado equivale al procesamiento secuencial.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Modelo base: no esta ajustado para seguir instrucciones ni para dialogo.
- Procesamiento de documentos largos mediante trozos de 1024 tokens procesados en paralelo y fusionados con un escaneo afin equivalente al secuencial.
- Inferencia de tiempo lineal respecto a la longitud de la secuencia gracias a la recurrencia con memoria EMA.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking).

## Casos de uso

- Investigacion en arquitecturas de tiempo lineal: el modelo sirve como banco de pruebas reproducible para comparar recurrencia con DCT frente a atencion, dado su tamano reducido y su licencia permisiva.
- Experimentacion con modelos base de bajo coste: permite iterar rapidamente en pipelines de generacion de texto en ingles con requisitos minimos de hardware.
- Procesamiento de documentos largos en investigacion: el modo de trozos de 1024 tokens con fusion afin permite estudiar el comportamiento en secuencias largas sin coste cuadratico.
- Generacion de texto en entornos con recursos limitados: sus ~30 M de parametros en FP16 permiten ejecucion en GPU de consumo e incluso en CPU, util para prototipos y docencia.
- Estudio de mecanismos de memoria: los coeficientes de decaimiento aprendidos por posicion de resolucion permiten analizar como el modelo olvida o retiene informacion a lo largo del tiempo.
- Base para ajuste fino experimental: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para experimentos de ajuste en tareas concretas de ingles, siempre evaluando antes su calidad.
- Reproduccion de resultados: el codigo con `trust_remote_code` y los pesos en FP16 facilitan la replicacion de experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 MB para los pesos en FP16 (~29,7 M de parametros), mas el estado de memoria recurrente y las activaciones, que son reducidas por el tamano del modelo.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM es suficiente; el modelo no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (por ejemplo, series RTX 30xx y 40xx) e incluso en CPU.
- Opciones de despliegue: al usar `trust_remote_code` y pesos en FP16, la via documentada es `transformers` con `AutoModelForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la arquitectura de tiempo lineal sugiere coste lineal con la longitud de secuencia, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede contrastar con modelos base de tamano similar, pero sin cifras de benchmark no es posible una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KenT-30M-Base | ~29,7 M | no disponible | Apache 2.0 | Hugging Face (trust_remote_code) |
| Alternativas de ~30 M | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion entrenado desde cero: el autor advierte explicitamente de que debe evaluarse antes de cualquier uso en el mundo real.
- Modelo base: no sigue instrucciones ni mantiene dialogos de forma fiable; no debe usarse directamente como asistente.
- Solo ingles: no se documenta soporte de otros idiomas.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo de 30 M de parametros, la coherencia y la fidelidad factual son limitadas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con Wikipedia y FineWeb-Edu, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y recomienda evaluacion previa.
- Requiere `trust_remote_code=True`: ejecuta codigo personalizado del repositorio, lo que implica revisar el codigo antes de usarlo en produccion.
- Restriccion tecnica: el tokenizer y los pesos deben coincidir con `vocab_size` en `config.json`.
- No se documentan cuantizaciones alternativas a FP16 ni soporte en frameworks de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Vi-LAB/KenT-30M-Base
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
