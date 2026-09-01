# youngseok12/AX-3.1-Light-sft_v0_21_medical_numerical_600

## Resumen

AX-3.1-Light-sft_v0_21_medical_numerical_600 es un modelo de lenguaje de 7.260 millones de parametros desarrollado por youngseok12, especializado en coreano y orientado a dominios medicos y calculo numerico. Se trata de un fine-tuning con LoRA SFT sobre el modelo base skt/A.X-3.1-Light, con los pesos del adaptador fusionados en el modelo final, de modo que no requiere cargar adaptadores adicionales en inferencia. El modelo esta pensado para investigacion y evaluacion controlada en coreano, no para uso en produccion sin supervision.

La relevancia de este modelo reside en su enfoque de entrenamiento con datos de dominio especifico: 600 filas de un conjunto fijo de 5.801 registros se sustituyeron por muestras deterministicas de dos datasets de AI Hub coreano, uno de conocimiento medico esencial (71875) y otro de lectura mecanica con operaciones numericas (71568). Esto lo convierte en un candidato interesante para evaluar el impacto de datos de dominio en modelos base coreanos de tamano medio, aunque su naturaleza experimental y su escasa difusion (0 descargas) limitan su aplicabilidad inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama, segun tags del repositorio) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (maxima secuencia de entrenamiento) |
| Tipos de cuantizacion | BF16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se inicializa desde skt/A.X-3.1-Light, un modelo coreano de 7B parametros con arquitectura transformer decoder-only similar a Llama. El fine-tuning se realizo con LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a todas las proyecciones atencionales (q, k, v, o) y a las capas del MLP (gate, up, down). Los pesos del adaptador se fusionaron posteriormente en el modelo base, produciendo un unico conjunto de pesos en BF16.

El entrenamiento utilizo un presupuesto fijo de 5.801 filas: 5.201 ejemplos sin cambios de la version v0.21 y 600 sustituciones deterministicas (300 de conocimiento medico de AI Hub 71875 y 300 de operaciones numericas de AI Hub 71568). Se entreno durante 1 epoca con learning rate 5e-5, optimizador AdamW fusionado, scheduler lineal sin warmup y una secuencia maxima de 2048 tokens. El run completo alcanzo una loss de entrenamiento de 0.3568975 tras 725 pasos de optimizacion. No se utilizaron datos de benchmarks publicos ni respuestas de benchmarks en el SFT.

## Capacidades

- Generacion de texto en coreano con seguimiento de instrucciones, gracias al SFT sobre el modelo base.
- Razonamiento con operaciones numericas basicas, entrenado con 300 ejemplos de lectura mecanica con calculos numericos.
- Conocimiento medico esencial en coreano, a partir de 300 ejemplos del dataset AI Hub 71875 de medicina esencial.
- Conversacion multi-turno en coreano, dado que el modelo base soporta formato conversacional.
- No soporta tool calling ni function calling de forma nativa, segun la informacion disponible.
- No se mencionan capacidades de vision, audio ni modo thinking explicito.
- Capacidades multilingues limitadas al coreano; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Evaluacion de modelos en coreano para dominios medicos: el modelo puede usarse en entornos de investigacion para medir el impacto de datos medicos especificos en la generacion de respuestas sobre sintomas, tratamientos o terminologia sanitaria en coreano.
- Pruebas de razonamiento numerico en coreano: dado su entrenamiento con 300 ejemplos de operaciones numericas, es util para experimentos controlados sobre calculo aritmetico y lectura de tablas o cifras en contexto.
- Comparativa de fine-tuning con LoRA en modelos coreanos: investigadores pueden reproducir el entrenamiento (los hiperparametros estan documentados) y comparar el efecto de las 600 sustituciones frente a la version v0.21 original.
- Desarrollo de prototipos de asistentes medicos en coreano: aunque no apto para produccion, puede servir como base para prototipos academicos que respondan preguntas frecuentes sobre salud con supervisión humana.
- Generacion de datos sinteticos de entrenamiento: el modelo puede emplearse para crear ejemplos adicionales de conversaciones medicas o numericas en coreano, siempre que se validen los resultados.
- Investigacion sobre alucinacion en dominios especializados: al ser un modelo experimental con datos de dominio limitados, es un candidato para estudiar tasas de alucinacion en contextos medicos y numericos frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones en K-AI Leaderboard ni comparaciones con otros modelos. La unica metrica reportada es la loss de entrenamiento (0.3568975), que no es comparable con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15 GB (7.26B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 40 GB para inferencia comoda; GPUs con 16 GB pueden funcionar con secuencias cortas.
- En consumer GPU: cabe en RTX 4090 y RTX 4080 (16 GB) con limitaciones de longitud de contexto; no cabe en GPUs de 12 GB o menos en BF16.
- Opciones de despliegue: transformers (carga directa con `from_pretrained`), vLLM (compatible con modelos Llama), TGI (text-generation-inference), llama.cpp si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| AX-3.1-Light-sft_v0_21_medical_numerical_600 | 7.26B | 2048 | Apache-2.0 | Coreano, medico y numerico |
| skt/A.X-3.1-Light (base) | 7.26B | no disponible | Apache-2.0 | Coreano general |
| youngseok12/AX-3.1-Light-sft_v3_0 | 7.26B | no disponible | Apache-2.0 | Coreano, instrucciones y dominio |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (modelos coreanos de 7B con especializacion medica) en los resultados de busqueda. La comparativa se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte explicitamente que puede producir respuestas incorrectas o inseguras y que no debe sustituir el consejo medico, financiero, legal o de otros expertos profesionales.
- Datos de entrenamiento limitados: solo 600 ejemplos de dominio especifico sobre un total de 5.801 filas; la cobertura de conocimiento medico y numerico es muy reducida.
- Sesgos potenciales: los datos de AI Hub pueden contener sesgos propios del contexto coreano; no se ha realizado una evaluacion de sesgos.
- Riesgo de alucinacion: alto en dominios especializados debido al volumen limitado de datos de dominio y a la ausencia de evaluacion con benchmarks.
- Idioma: el modelo esta entrenado principalmente para coreano; su rendimiento en otros idiomas no esta garantizado.
- Licencia: Apache-2.0 para el modelo, pero los terminos de los datasets de AI Hub (71875 y 71568) se aplican al uso de los datos de entrenamiento; es necesario revisar dichos terminos antes de un uso comercial.
- Sin garantias de produccion: no hay informacion sobre latencia, throughput ni estabilidad en entornos de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_medical_numerical_600
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Dataset AI Hub 71875 (conocimiento medico): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=data&dataSetSn=71875
- Dataset AI Hub 71568 (operaciones numericas): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=data&dataSetSn=71568
- Variante relacionada del mismo autor: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
- Variante con filtrado numerico: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_numerical_300
