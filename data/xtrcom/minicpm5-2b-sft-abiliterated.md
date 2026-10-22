# XtrCom/MINICPM5-2B-SFT-Abiliterated

## Resumen

MINICPM5-2B-SFT-Abiliterated es una edición de pesos del modelo openbmb/MiniCPM5-2B-SFT publicada por el usuario XtrCom en HuggingFace. No se trata de un fine-tuning ni de un modelo entrenado desde cero: es el mismo checkpoint base al que se le ha proyectado fuera la denominada «dirección de rechazo» en 84 matrices de pesos (o_proj de atención y down_proj del MLP) a lo largo de las 42 capas de la red. El resultado declarado por el autor es un modelo sin comportamiento de rechazo, que acepta peticiones que el modelo base deniega.

Arquitectónicamente es un transformer decoder-only denso de 2.516.756.480 parámetros (2,52 B), con clase LlamaForCausalLM, 42 capas, hidden_size de 2048, intermediate_size de 6144, atención GQA con 16 cabezas de consulta y 2 de clave/valor (head_dim 128), rope_theta de 5e6 y una ventana máxima de 131.072 tokens. Los pesos se distribuyen en un único shard safetensors en bfloat16 de 5,03 GB. El vocabulario es de 130.560 tokens y la model card solo declara inglés como idioma.

Su relevancia es doble. Por un lado, documenta con detalle inusual un método de abliteración sin etiquetas (contraste de medias poblacional sobre el stream residual) y publica métricas de coste —perplejidad, batería de opción múltiple, tasa de rechazo y degeneración— frente al modelo base. Por otro, es explícitamente un artefacto de investigación sin comportamiento de rechazo, con licencia Apache 2.0 y cero descargas o interacciones en el momento de la ficha, lo que lo sitúa como objeto de estudio de alineación y red teaming más que como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, clase `LlamaForCausalLM`; 42 capas; hidden_size 2048; intermediate_size 6144; GQA con 16 q-heads y 2 kv-heads; head_dim 128 |
| Parámetros totales | 2.516.756.480 (2,52 B), según safetensors |
| Parámetros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | 131.072 tokens (`max_position_embeddings`); `rope_theta` = 5e6 |
| Tipos de cuantización | no disponible; el repositorio solo publica bfloat16 y no se incluyen GGUF ni variantes cuantizadas |
| Idiomas soportados | inglés (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bfloat16, un único shard de 5,03 GB |
| Vocabulario | 130.560 tokens |
| Matrices modificadas | 84 tensores (`self_attn.o_proj` + `mlp.down_proj`, capas 0–41) |
| Modelo base | openbmb/MiniCPM5-2B-SFT |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer causal denso de 42 capas con atención por grupos (16 cabezas de consulta frente a 2 de clave/valor), dimensión de cabeza 128, MLP con intermediate_size 6144 y codificación posicional RoPE con theta de 5e6, lo que habilita la ventana declarada de 131.072 tokens. Sobre los datos de entrenamiento del checkpoint SFT original (número de tokens, composición del corpus, si hubo RLHF o DPO) no hay información en la documentación proporcionada: no disponible.

La modificación no implica entrenamiento alguno. El autor extrae una dirección de rechazo sin etiquetas ejecutando el modelo base sobre dos conjuntos de 20 prompts cada uno (uno de peticiones que el modelo deniega y otro de peticiones benignas pero alarmantes que no debería denegar) y calculando la diferencia de medias del stream residual en el último token del prompt; la dirección se toma en la capa 21. Después proyecta esa dirección fuera de cada matriz seleccionada mediante `W ← W − α · v (vᵀW)` con `‖v‖ = 1`, aplicando α = 1,0 en las 42 capas. En `o_proj` se elimina la componente `v` de cada columna y en `down_proj` la de cada fila. La energía L2 eliminada respecto a la matriz original tiene mediana del 2,25 % (media 2,30 %, rango 2,01 %–2,99 %), con máximos por capa en L18–L21, justo donde se extrajo la dirección.

El propio autor compara dos configuraciones: profundidad completa (42 capas) frente a una banda estrecha (capas 13–29). La banda estrecha apenas reduce la propensión al rechazo hasta que el efecto se pasa de frenada (α = 1,5 produce una propensión de −0,3405, es decir, el modelo se inclina a cumplir incluso ante prompts dañinos) y además degrada la capacidad. La edición a profundidad completa con α = 1,0 es, según sus mediciones, más eficaz y más barata en calidad. No se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal, modos de razonamiento) más allá de la edición de pesos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del checkpoint SFT (formato de chat tipo Llama).
- Contexto largo de hasta 131.072 tokens declarados, adecuado para documentos extensos o historiales de conversación amplios.
- Cumplimiento de peticiones sin rechazo: el autor reporta 100 % de cumplimiento (20/20) en su batería de prompts dañinos, frente al 20 % del modelo base.
- Mantiene capacidad de opción múltiple en la batería de screening del autor: media MC de 0,4000 frente a 0,3625 del base (+10,3 %), con ARC 0,4625, MMLU 0,4625 y HellaSwag 0,2750.
- Generación de código: soporta la perplejidad medida sobre código de la stdlib de Python (3,798 tras la ablación), por lo que conserva competencia sintáctica básica, aunque sin benchmarks de código publicados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta modo thinking ni planificación estructurada.
- Capacidades multimodales (visión, audio): no disponibles en esta variante; la model card solo declara `text-generation`.

## Casos de uso

- Investigación en interpretabilidad y alineación: servir como contraejemplo controlado para estudiar qué representa la «dirección de rechazo» y cómo se distribuye por capas, comparando directamente con el checkpoint base sobre las mismas 42 capas.
- Red teaming de clasificadores de moderación: generar respuestas que el modelo base rechaza para probar la robustez de filtros de entrada/salida y de sistemas de detección de contenido dañino antes de desplegarlos.
- Evaluación de la degradación por ablación: usar sus curvas de perplejidad (×1,034 en wikitext, ×1,063 en código Python) como referencia para medir cuánto cuesta en calidad retirar un comportamiento aprendido, con la ventaja de tener el informe de ablación por matriz.
- Docencia y divulgación técnica: ilustrar en un curso de alineación cómo una edición lineal de rango uno sobre 84 matrices altera un comportamiento de seguridad sin reentrenar, con cifras de energía eliminada y métricas de degeneración.
- Generación creativa de ficción o narrativa con temáticas sensibles, en un entorno local y con revisión humana posterior, aprovechando que el modelo no aplica rechazos por defecto; requiere políticas de uso internas claras.
- Prototipado local de asistentes conversacionales en hardware de consumo: 2,52 B parámetros y 5,03 GB en bfloat16 permiten ejecución en una única GPU de gama media, útil para probar pipelines de inferencia con contexto largo antes de escalar a modelos mayores.
- Estudio de estabilidad de la generación tras ediciones de pesos: su tasa de degeneración medida (0 de 20 respuestas con rep-4 medio de 0,0052) lo convierte en un punto de comparación frente a otras técnicas de abliteración que producen salidas repetitivas.

## Benchmarks y rendimiento

Datos publicados por el autor. Batería de 240 ítems de opción múltiple (80 de ARC, 80 de MMLU, 80 de HellaSwag, corregidos por letra), perplejidad sobre wikitext y código de la stdlib de Python, y margen de log-probabilidad de rechazo normalizado por longitud. Semilla única.

| Benchmark | Base SFT | Abliterado (α=1,0, 42 capas) | Cambio |
|---|---|---|---|
| ARC | 0,3750 | 0,4625 | +0,0875 |
| MMLU | 0,4125 | 0,4625 | +0,0500 |
| HellaSwag | 0,3000 | 0,2750 | −0,0250 |
| Media opción múltiple | 0,3625 | 0,4000 | +0,0375 (+10,3 %) |
| Perplejidad wikitext | 11,823 | 12,219 | ×1,034 |
| Perplejidad código Python | 3,571 | 3,798 | ×1,063 |
| Propensión al rechazo (margen) | 0,7010 | 0,0973 | −86 % |

Barrido de α a profundidad completa (42 capas):

| α | Media opción múltiple | PPL wikitext (ratio) | PPL código (ratio) | Propensión al rechazo |
|---|---|---|---|---|
| 0 (base) | 0,3625 | 1,0000 | 1,0000 | 0,7010 |
| 0,25 | 0,3792 | 1,0034 | 1,0078 | 0,7004 |
| 0,50 | 0,3875 | 1,0041 | 1,0117 | 0,6235 |
| 1,00 | 0,4000 | 1,0335 | 1,0634 | 0,0973 |

Comportamiento en generación real (decodificación greedy, 20 prompts dañinos y 20 benignos pero alarmantes):

| Modelo | Cumplimiento (dañinos) | Sobre-rechazo (benignos) | Degeneración | Tasa de hedging |
|---|---|---|---|---|
| Base SFT | 20 % (4/20) | 15 % (3/20) | 0 % | 85 % |
| α=0,5, todas las capas | 30 % | 5 % | 0 % | 75 % |
| α=1,0, capas 13–29 | 70 % | 5 % | 0 % | 55 % |
| α=1,5, capas 13–29 | 95 % | 10 % | 0 % | 10 % |
| α=1,0, todas las capas | 100 % (20/20) | 0 % (0/20) | 0 % | 15 % |

No se han publicado resultados de benchmarks estándar externos (MMLU completo, HumanEval, GSM8K) en la información disponible; las cifras anteriores proceden de la batería propia del autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 los pesos ocupan 5,03 GB, por lo que se necesita aproximadamente 6–7 GB de VRAM incluyendo caché KV y overhead del runtime. Cifras orientativas para cuantizaciones calculadas a partir del número de parámetros (no publicadas por el autor): ~2,6 GB en int8 y ~1,4–1,6 GB en 4 bits.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para uso local en bfloat16; A100 40/80 GB, H100 o L40S para servir con lotes grandes y contexto largo (la ventana de 131.072 tokens dispara el consumo de caché KV por la configuración GQA de 2 kv-heads).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en bfloat16 y en tarjetas de 4–6 GB si se cuantiza a 4 bits, siempre que el runtime soporte la arquitectura.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM por compatibilidad con la arquitectura Llama; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que el autor no publica y cuya compatibilidad con `rope_theta=5e6` no está verificada en la información disponible.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MINICPM5-2B-SFT-Abiliterated (este) | 2,52 B | 131.072 | Eliminado a nivel de pesos (100 % de cumplimiento en la batería del autor) | Apache 2.0 | Repo público, 0 descargas, 0 likes |
| openbmb/MiniCPM5-2B-SFT (base) | 2,52 B | 131.072 | Presente (20 % de cumplimiento, 15 % de sobre-rechazo) | Apache 2.0 (según metadatos del derivado) | Repo público |
| Variante α=1,5, capas 13–29 (misma técnica) | 2,52 B | 131.072 | Sobre-eliminado: propensión −0,3405, se inclina a cumplir; capacidad degradada (MC 0,3542) | Apache 2.0 | No distribuida como checkpoint independiente en la información disponible |
| Otros modelos abliterados de 2–3 B (p. ej. derivados de Llama, Qwen o Gemma) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al propio repo: la edición a profundidad completa mejora la media de opción múltiple (+0,0375) y elimina el rechazo, mientras que la banda estrecha con α alto destruye capacidad y sobrecorrige el comportamiento. No hay datos en la información proporcionada para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Ausencia total de comportamiento de rechazo: el autor declara explícitamente que el modelo cumplirá peticiones que el base deniega. No es apto para exposición directa a usuarios finales sin una capa externa de moderación.
- Riesgo de uso indebido: la model card incluye ejemplos de cumplimiento ante peticiones delictivas. Cualquier despliegue debe acompañarse de filtrado de entrada y salida y de registro de auditoría.
- Alucinación: no se han publicado mediciones de veracidad ni de tasa de alucinación; el modelo conserva los sesgos del checkpoint SFT original, que no están documentados en la información disponible.
- Coste medido en calidad: +3,4 % de perplejidad en wikitext y +6,3 % en código Python. El código es el eje más afectado, por lo que no es recomendable para tareas de programación sensibles a la precisión.
- Señal mixta en benchmarks: ARC y MMLU suben, HellaSwag baja (−0,0250). La batería es de 240 ítems con una sola semilla, de modo que las diferencias están dentro del ruido y no deben interpretarse como ganancias reales de capacidad.
- Idiomas: solo se declara inglés. El comportamiento en castellano no está evaluado y previsiblemente será inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente; el derivado no transfiere garantías sobre el uso legítimo del contenido generado ni exime de las obligaciones legales aplicables.
- Madurez del artefacto: 0 descargas, 0 likes, fecha de creación registrada como 2026-10-21 y model card truncada a mitad de una frase en el ejemplo de comparación de respuestas. No hay tests de regresión, versionado ni mantenimiento conocido.
- Despliegue: no se publican pesos cuantizados ni GGUF; la conversión a llama.cpp u Ollama es responsabilidad del usuario y la compatibilidad con `rope_theta=5e6` y la ventana de 131.072 tokens no está verificada.
- Riesgo de degeneración en otras configuraciones: aunque en la configuración publicada el autor reporta 0/20 respuestas degeneradas, la banda estrecha con α alto generó un 15 % de respuestas degeneradas según su propia nota, lo que indica que la técnica es sensible a los hiperparámetros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XtrCom/MINICPM5-2B-SFT-Abiliterated
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Informe de ablación por matriz (`ablation_report.json`): referenciado en la model card, disponible en el repositorio del modelo
- Paper, blog o repositorio de la técnica de abliteración: no disponible en la información proporcionada
- Demos o espacios: no disponibles
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre el modelo; las búsquedas devolvieron únicamente contenido no relacionado y sin valor técnico, por lo que se descartan.
