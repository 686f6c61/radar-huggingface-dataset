# tsinghua-sigs-robot-lab/VeriLoop-E2-Q8_0-GGUF

## Resumen

VeriLoop E2 Q8_0 GGUF es la distribucion cuantizada a 8 bits para llama.cpp del modelo VeriLoop E2, un modelo post-entrenado de 27B construido sobre Qwen3.8-27B y orientado a codigo, ingenieria de software, matematicas y fisica. Lo desarrolla Tsinghua SIGS Robot Lab (autor: Libo Wang) y se publica bajo licencia Apache 2.0, con soporte nativo de ingles y chino y una ventana de contexto de 262K tokens.

El repositorio no es un "relanzamiento" del modelo con nombres de benchmark nuevos: su proposito declarado es medir la distorsion introducida por la cuantizacion Q8_0 frente al GGUF canonico en BF16 bajo un protocolo fijo y reproducible con llama.cpp. El resultado central publicado es que Q8_0 reduce la huella del GGUF un 46,86 % a cambio de un aumento del 0,0643 % en la perplejidad de WikiText-2, con una divergencia KL media de 0,002176 y un 98,815 % de coincidencia en la decision top-p.

El interes practico es doble: por un lado, permite ejecutar un modelo de ~26,9 mil millones de parametros en 8 bits con una perdida de fidelidad documentada y medida contra una referencia BF16; por otro, incluye un modelo borrador MTP opcional para decodificacion especulativa, lo que abre la puerta a acelerar la generacion en despliegues locales con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base post-entrenado derivado de Qwen3.8-27B; el autor no detalla la arquitectura en la informacion disponible) |
| Parametros totales | 26.895.998.464 (≈26,9B; dato real de safetensors del modelo base). El autor lo describe como "27B" |
| Longitud de contexto | 262K tokens nativos |
| Tipos de cuantizacion | Q8_0 (8 bits) para pesos principales; 353 tensores en F32; densidad efectiva 8,50 BPW. Existe referencia canonica en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp). Fichero principal de 851 tensores (498 Q8_0 + 353 F32) y GGUF MTP opcional de 18 tensores + metadatos auxiliares |
| Tamano del repositorio | 31,9 GB (incluye modelo principal y borrador MTP) |
| Tamano exacto de ficheros | no disponible (los campos `{{Q8_GIB}}`, `{{Q8_GB}}` y los SHA256 aparecen sin rellenar en la model card) |
| Modelo base | tsinghua-sigs-robot-lab/VeriLoop-E2 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna (atencion, numero de capas, configuracion de cabezas KV ni tipo de normalizacion). El unico dato estructural es el modelo base declarado: un modelo post-entrenado de 27B construido sobre Qwen3.8-27B, con 26.895.998.464 parametros reales en safetensors. Los tags del autor incluyen "post-training" y "long-context", y la model card confirma una ventana nativa de 262K tokens.

En el plano del entrenamiento, la informacion proporcionada se limita a indicar que se trata de un modelo post-entrenado orientado a codigo, agente de codigo, ingenieria de software, razonamiento matematico y razonamiento cientifico. No se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta ninguna innovacion de atencion (atencion lineal, SSM, hibrida) en el material disponible.

La innovacion tecnica documentada en este repositorio concreto no esta en el entrenamiento, sino en la publicacion: un protocolo fijo de comparacion BF16 frente a Q8_0 con medicion de perplejidad emparejada, divergencia KL, coincidencia top-p, desviacion RMS de probabilidad de token y correlacion log-PPL. Ademas, se publica un modelo borrador MTP (multi-token prediction) opcional de 18 tensores para decodificacion especulativa, con carga y ruta de borrador verificadas en llama.cpp.

## Capacidades

- Generacion de texto conversacional (tag "conversational") en ingles y chino.
- Generacion y asistencia en codigo, con orientacion explicita a ingenieria de software y agente de codigo segun los tags del autor.
- Razonamiento matematico, incluyendo evidencia publicada de un artefacto relacionado con la hipotesis de Riemann.
- Razonamiento cientifico, con mencion explicita a fisica en la model card.
- Procesamiento de contexto largo: 262K tokens nativos, adecuado para repositorios, documentos y trazas extensas.
- Decodificacion especulativa opcional mediante un modelo borrador MTP publicado como GGUF aparte.
- Compatibilidad con endpoints (`endpoints_compatible`) segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: al distribuirse en GGUF Q8_0 para llama.cpp, puede ejecutarse en estaciones de trabajo o servidores sin exponer el codigo a APIs externas, con una perdida de fidelidad medida de solo +0,0643 % de perplejidad frente a BF16.
- Revision de bases de codigo extensas: la ventana de 262K tokens permite cargar varios modulos o un repositorio de tamano medio en una sola pasada para detectar inconsistencias, dependencias cruzadas y patrones repetidos.
- Refactorizacion y migracion de codigo: el modelo esta orientado a ingenieria de software, por lo que puede emplearse para reescribir modulos, actualizar APIs obsoletas y generar parches acompanados de explicacion.
- Razonamiento matematico asistido: util para verificar pasos de demostraciones, resolver problemas simbolicos y contrastar derivaciones, con un artefacto publico de referencia en torno a la funcion zeta de Riemann.
- Analisis de fisica y calculo cientifico: la model card menciona explicitamente fisica; puede usarse para derivar expresiones, comprobar dimensiones y generar codigo de simulacion numerica.
- Documentacion tecnica bilingue ingles-chino: permite generar y traducir documentacion de producto o API entre ambos idiomas en el mismo contexto, sin cambiar de modelo.
- Procesamiento de trazas y logs largos en operaciones: con 262K tokens se pueden ingestar logs de un incidente completo o series de eventos de CI para resumir causas raiz.
- Aceleracion de inferencia con decodificacion especulativa: el borrador MTP publicado permite activar la ruta de draft en llama.cpp para reducir la latencia por token en generaciones largas, siempre que el presupuesto de memoria lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea final (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo que si se publica es la medicion de fidelidad de la cuantizacion Q8_0 frente al GGUF canonico en BF16, bajo un protocolo fijo con llama.cpp:

| Metrica | Referencia BF16 | Q8_0 | Deriva Q8_0 |
|---|---:|---:|---:|
| Perplejidad media | 4,840423 ± 0,119931 | 4,843536 ± 0,120062 | +0,003113 / +0,0643 % |
| Ratio de perplejidad | 1,000000 | 1,000643 ± 0,000754 | +0,0643 % |
| KL divergencia media vs BF16 | 0 | 0,002176 ± 0,000668 | menor es mejor |
| Coincidencia top-p | 100 % (referencia) | 98,815 ± 0,120 % | 1,185 puntos porcentuales de discrepancia |
| RMS de Δp por token | 0 % (referencia) | 1,251 ± 0,137 % | escala de ruido distribucional |
| Δp medio por token | 0 % (referencia) | −0,007 ± 0,014 % | sesgo direccional casi nulo |
| Correlacion log-PPL | 100 % (referencia) | 99,95 % | acuerdo muy alto |

Puertas de calidad declaradas por el autor (no estandares universales de la industria):

| Puerta | Umbral | Medido | Resultado |
|---|---:|---:|---|
| Ratio de perplejidad | ≤ 1,005 | 1,000643 | PASS |
| KLD media | ≤ 0,005 | 0,002176 | PASS |
| Coincidencia top-p | ≥ 97,0 % | 98,815 % | PASS |
| Auditoria de tensores principales | 851 tensores | 851 | PASS |
| Carga y generacion en llama.cpp | requerido | PASS | PASS |
| Carga MTP y ruta de borrador especulativo | requerido | PASS | PASS |

Estas cifras miden distorsion por cuantizacion, no el rendimiento del modelo en tareas downstream.

## Requisitos de hardware

- VRAM para el fichero principal: estimacion derivada de 26.895.998.464 parametros a 8,50 BPW, en torno a 28,6 GB solo para pesos. El autor no publica el tamano exacto del fichero (los campos de la model card aparecen sin rellenar).
- Memoria adicional para el borrador MTP: 18 tensores mas metadatos auxiliares; el autor no publica el tamano exacto, por lo que no puede cuantificarse con precision.
- Cache KV: no disponible. Con 262K tokens de contexto, la cache KV puede superar ampliamente el tamano de los pesos segun la configuracion de capas y cabezas, que no se documenta.
- GPU recomendadas: no especificadas por el autor. Por alojar los pesos completos, el modelo apunta a GPU con 40-80 GB (A100 40/80 GB, H100) o a configuraciones multi-GPU de 24 GB (por ejemplo, 2 x RTX 4090) con reparto de capas.
- GPU de consumo: una unica RTX 4090 de 24 GB no permite alojar los pesos Q8_0 completos; seria necesaria descarga parcial a CPU o cuantizaciones menores no publicadas en este repositorio.
- Memoria unificada: equipos Apple con 36-64 GB de memoria unificada son un candidato razonable para inferencia con llama.cpp, aunque no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp (runtime validado por el autor), y por compatibilidad de formato, servidores GGUF derivados. vLLM, TGI u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato de rendimiento indirecto es la existencia de una ruta de decodificacion especulativa MTP verificada, cuyo factor de aceleracion no se cuantifica.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de terceros en la informacion proporcionada. La comparacion posible es contra la referencia BF16 del mismo modelo:

| Version | Formato | Parametros | Contexto | Huella | Fidelidad | Licencia |
|---|---|---:|---:|---|---|---|
| VeriLoop E2 Q8_0 GGUF | GGUF Q8_0 (8,50 BPW) | ~26,9B | 262K | −46,86 % frente a BF16 | PPL +0,0643 %, KLD 0,002176, top-p 98,815 % | Apache 2.0 |
| VeriLoop E2 canonico | GGUF BF16 | ~26,9B | 262K | referencia | 1,000000 (referencia) | Apache 2.0 |

Comparativas con otras familias de modelos del mismo rango (parametros, contexto, rendimiento, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- Las cifras publicadas miden distorsion de cuantizacion, no calidad en tareas finales. El propio autor advierte que no debe interpretarse que cada benchmark downstream cambia exactamente un 0,0643 %.
- No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible, lo que impide comparar el modelo con alternativas de forma objetiva.
- La model card contiene marcadores de plantilla sin rellenar (`{{Q8_GIB}}`, `{{Q8_GB}}`, `{{Q8_BYTES}}` y los SHA256 de ambos ficheros), por lo que el tamano exacto y la verificacion de integridad no pueden comprobarse con los datos publicados.
- Las puertas de calidad (PPL ratio ≤ 1,005, KLD ≤ 0,005, top-p ≥ 97 %) son umbrales internos de VeriLoop, no estandares de la industria.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- Contexto nominal de 262K tokens sin datos publicos sobre la cache KV, lo que hace impracticable estimar el coste real de memoria en el extremo de la ventana.
- Riesgo de alucinacion: inherente a los modelos generativos, sin evaluacion de fidelidad factual publicada en este repositorio. Debe validarse cualquier salida en entornos de produccion, especialmente en codigo y matematicas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o alineacion en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y copyright. Al derivar de Qwen3.8-27B, conviene revisar las condiciones de la cadena de modelos base.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- El modelo borrador MTP anade consumo de memoria y requiere una ruta de decodificacion especulativa compatible; su ganancia real de latencia no se cuantifica.
- La denominacion "Qwen3.8-27B" como modelo base no se acompana de enlace ni ficha verificable en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2-Q8_0-GGUF
- Modelo base (parent model): https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Informe tecnico (OpenReview): https://openreview.net/forum?id=P6FIQILHwX&noteId=P6FIQILHwX
- Evidencia de evaluacion (dataset): https://huggingface.co/datasets/tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence
- Artefacto de la funcion zeta de Riemann (GitHub): https://github.com/brucewang123456789/GeniusTrail/tree/VeriLoop-E2/riemann-hypothesis
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Logotipo VeriLoop: https://huggingface.co/tsinghua-sigs-robot-lab/veriloop-coder-e1/resolve/main/veriloop_logo.png
