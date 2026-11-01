# zongyueq/LLoPS-360M

## Resumen

LLoPS-360M es un modelo de lenguaje de 360 millones de parametros desarrollado por Zongyue Qin, publicado bajo licencia Apache-2.0. Se trata de un ajuste continuado (continual training) del modelo `hazyresearch/based-360m`, en el que se sustituye el mecanismo de atencion lineal global de BASED por un sketch polinomial de bajo rango y grado 4 entrenable, tecnica que da nombre al modelo (Learnable Low-Rank Polynomial Sketch). El objetivo es mejorar la expresividad de la atencion lineal manteniendo la complejidad lineal en la longitud de secuencia.

El modelo parte de la arquitectura BASED (linear attention con mezcla de atencion lineal global y ventana local) y ha sido reentrenado sobre el subconjunto SlimPajama-6B con secuencias de 2048 tokens. Usa el tokenizador de GPT-2 y esta pensado exclusivamente para generacion de texto en ingles. Es un modelo de investigacion: no ha pasado por instruccion ni por auditorias de despliegue, y su model card lo declara explicitamente como "raw pretrained language model".

Su relevancia es fundamentalmente academica: sirve como banco de pruebas para estudiar variantes de atencion lineal eficiente frente a la atencion cuadratica estandar, y permite comparar el impacto del sketch polinomial aprendible sobre el BASED original en tareas zero-shot. No es un modelo orientado a producto ni a uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal BASED (global linear attention + ventana local), sketch polinomial de bajo rango grado 4 |
| Parametros totales | 360M (aproximado, segun nombre del modelo y base `hazyresearch/based-360m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en precision completa; sin GGUF publicado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (repo de 1.8 GB); requiere carga via `GPTSketchLMHeadModel.from_pretrained_hf` |

## Arquitectura y entrenamiento

LLoPS-360M es un transformer decoder-only basado en BASED, la arquitectura de atencion lineal de HazyResearch que combina una atencion lineal global aproximada con una atencion de ventana local exacta. La innovacion del modelo consiste en reemplazar la funcion de feature map fija del BASED original por un sketch polinomial de bajo rango de grado 4 entrenable (`llops_power=2`, con el termino lineal desactivado). Este sketch aproxima el nucleo de atencion con un polinomio de bajo rango cuyos coeficientes se aprenden, lo que en teoria permite mayor capacidad expresiva que un feature map fijo sin renunciar a la complejidad lineal en la longitud de secuencia.

El entrenamiento es un ajuste continuado sobre el modelo base `hazyresearch/based-360m`, usando el dataset SlimPajama-6B con secuencias de 2048 tokens. No se documenta en la informacion disponible el numero exacto de tokens vistos, la composicion detallada del dataset, ni si hubo fases de RLHF o DPO; la model card indica que es un modelo preentrenado en bruto, sin instruccion. El tokenizador es el de GPT-2. La implementacion se distribuye a traves del repositorio LLoPS, derivado de HazyResearch/BASED.

## Capacidades

- Generacion de texto autoregresiva en ingles, con decodificacion estandar.
- Modelado de lenguaje de proposito general (language modeling) sobre texto en ingles.
- Razonamiento basico y respuesta a preguntas de sentido comun a nivel de modelo pequeno (resultados zero-shot en WinoGrande, PIQA, ARC, HellaSwag).
- Evaluacion de comprension lectora y extraccion de respuestas (SQuAD, SWDE, FDA) en regimen zero-shot.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado (no hay modo thinking).
- No tiene capacidades de vision, audio ni multimodalidad.
- Multilingue: no; solo ingles.
- No esta instruido: no sigue instrucciones ni mantiene formato conversacional de forma fiable.

## Casos de uso

- Investigacion en atencion lineal eficiente: el modelo sirve para comparar el sketch polinomial aprendible frente al feature map fijo de BASED en tareas zero-shot, midiendo el efecto del grado del polinomio y del rango del sketch sobre el rendimiento.
- Experimentos de ablacion academica: al estar entrenado sobre SlimPajama-6B con secuencias de 2048, permite reproducir y extender estudios sobre la calidad de aproximaciones de atencion lineal en modelos de 360M.
- Generacion de texto de dominio general en ingles para prototipos: puede usarse para completar texto o generar articulos cortos en entornos de investigacion donde no se requiera instruccion ni alta calidad.
- Benchmark de infraestructura de inferencia: su tamano (360M) y su atencion lineal lo hacen util para probar kernels y pipelines de despliegue eficiente en secuencias de 2048 tokens.
- Fine-tuning posterior como base de investigacion: al ser Apache-2.0 y estar disponible en PyTorch, puede servir como punto de partida para ajustes supervisados o estudios de destilacion.
- Evaluacion de alucinacion y sesgos en modelos pequenos: util como linea base en estudios comparativos de fiabilidad de modelos de menos de 1B parametros.

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card:

| Tarea | Resultado |
|---|---:|
| WinoGrande | 52.09 |
| PIQA | 66.87 |
| LAMBADA | 29.25 |
| HellaSwag | 37.06 |
| ARC-Easy | 43.81 |
| ARC-Challenge | 25.43 |
| FDA | 7.44 |
| SWDE | 31.41 |
| SQuAD | 32.21 |

Notas: PIQA, HellaSwag, ARC-Easy y ARC-Challenge usan exactitud normalizada; LAMBADA reporta exactitud. Todas las tareas se evaluan en regimen zero-shot. No se proporcionan comparaciones directas con el modelo base ni con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1.5-2 GB para los pesos, mas overhead de activaciones y cache; el repo pesa 1.8 GB.
- En fp16/bf16: alrededor de 0.8-1 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para pruebas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la carga requiere el codigo del repositorio LLoPS (`based.models.gpt_unified.GPTSketchLMHeadModel`), no es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin adaptacion, ya que no se publican pesos en GGUF ni un formato estandar de transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; la atencion lineal deberia ofrecer ventajas teoricas en secuencias largas, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| LLoPS-360M | 360M | 2048 | Apache-2.0 | Sketch polinomial grado 4 sobre BASED; solo ingles; sin instruccion |
| hazyresearch/based-360m | 360M | no disponible | no disponible | Modelo base original de BASED, atencion lineal con feature map fijo |
| GPT-2 355M | 355M | 1024 | MIT | Transformer estandar con atencion cuadratica; linea base clasica de 360M |
| Pythia-410M | 410M | 2048 | Apache-2.0 | Transformer estandar, suite de investigacion con checkpoints intermedios |

No se dispone de resultados de benchmarks comparativos directos entre LLoPS-360M y estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo preentrenado en bruto: no ha sido instruido ni alineado, por lo que no sigue instrucciones de forma fiable y puede generar texto incoherente o repetitivo.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo de alucinacion elevado: como modelo pequeno sin alineacion, tiende a inventar hechos y a producir afirmaciones no verificadas.
- Sesgos: al entrenarse sobre SlimPajama, hereda los sesgos presentes en ese corpus web; no se documenta ninguna mitigacion.
- Contexto limitado a 2048 tokens; no se garantiza generalizacion a secuencias mas largas pese a la atencion lineal.
- No auditado para despliegue en produccion; la propia model card lo advierte.
- Dependencia de codigo externo: la carga requiere el repositorio LLoPS y una clase personalizada, lo que complica la integracion con ecosistemas estandar.
- Licencia Apache-2.0 permite uso comercial, pero la falta de calidad y de alineacion hace desaconsejable su uso en producto sin fine-tuning y evaluacion previas.
- Sin datos publicados sobre cuantizacion, por lo que no hay pesos GGUF ni versiones optimizadas listas para usar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zongyueq/LLoPS-360M
- Repositorio LLoPS: https://github.com/ZongyueQin/LLoPS
- Modelo base BASED-360M: https://huggingface.co/hazyresearch/based-360m
- Dataset SlimPajama-6B: https://huggingface.co/datasets/DKYoon/SlimPajama-6B
- Repositorio BASED (HazyResearch): https://github.com/HazyResearch/based
