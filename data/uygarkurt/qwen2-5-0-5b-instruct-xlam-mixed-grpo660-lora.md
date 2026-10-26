# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo660-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo660-lora` es un adaptador LoRA entrenado con Group Relative Policy Optimization (GRPO) sobre el modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct`. Lo desarrolla uygarkurt y su objetivo es muy concreto: mejorar la llamada estructurada a herramientas (tool calling) y, sobre todo, la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. No es un modelo nuevo, sino un ajuste fino de pesos adicionales que debe cargarse sobre el modelo base original.

El entrenamiento se realizó con la herramienta Post-Training Lab sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, con 660 actualizaciones de GRPO y un coste declarado de 0,5 horas de bucle de entrenamiento, lo que lo convierte en un experimento de bajo coste reproducible en una sola GPU. El modelo base aporta la arquitectura transformer decoder-only de ~0,49 mil millones de parámetros y la ventana de contexto de la familia Qwen2.5.

Su relevancia es doble: por un lado, demuestra que el RL a pequeña escala produce ganancias medibles en precisión de nombre de función y en abstención (+2,01 y +1,88 puntos respectivamente frente al base); por otro, sirve como caso de estudio honesto de los límites del ajuste con RL en modelos de 0,5B, donde las mejoras en tool calling conviven con retrocesos en matemáticas e instrucciones. Es un artefacto de investigación y prototipado, no un modelo listo para producción crítica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) + adaptador LoRA (PEFT) |
| Parámetros totales | ~0,49 B en el modelo base; parámetros entrenables del adaptador no disponibles |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según la especificación del modelo base Qwen2.5; no indicado en la model card del adaptador |
| Tipos de cuantización | El adaptador se distribuye en safetensors sin cuantizar; admite fusión con el base y posterior cuantización (GGUF, AWQ, GPTQ) con herramientas estándar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible en la información proporcionada (la model card del adaptador no la declara; el modelo base Qwen2.5-0.5B-Instruct se publica bajo Apache-2.0) |
| Formato de pesos | safetensors con pesos de adaptador LoRA (librería `peft`); requiere `transformers` + `peft` para cargar |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención de tipo causal, normalización RMSNorm, activación SwiGLU y embeddings/atención agrupada (GQA) según la familia Qwen2.5. Sobre ese modelo se entrena un adaptador LoRA de rango e hiperparámetros no especificados en la model card. El proceso no parte de un modelo intermedio ni de un SFT previo: el GRPO arranca directamente del modelo instructivo original, según declara el autor.

El ajuste se realizó con Group Relative Policy Optimization, una variante de optimización por política con recompensas verificables que agrupa varias generaciones por prompt y normaliza la ventaja dentro del grupo, evitando la necesidad de un modelo crítico separado. Se ejecutaron 660 actualizaciones sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`, orientado a llamadas a funciones y a la decisión de abstención ante herramientas irrelevantes. El tiempo declarado de bucle de entrenamiento es de 0,5 horas, excluyendo carga de modelo, preparación de datos y evaluación externa. No se detalla la composición exacta del dataset, el número de tokens vistos ni la función de recompensa concreta.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Llamada estructurada a herramientas (tool calling / function calling) en formatos tipo JSON, con 65,85 % de exactitud de llamada completa en el holdout xLAM ETC y 91,91 % de exactitud de nombre de función.
- Abstención ante herramientas irrelevantes: 67,74 % de acierto en el subconjunto de irrelevancia, frente al 66,93 % del base.
- Razonamiento básico y matemáticas elementales, con rendimiento bajo (MATH-500: 14,00 %).
- Seguimiento de instrucciones limitado (IFEval estricto a nivel de prompt: 25,69 %).
- Capacidad multilingüe no declarada: el autor solo etiqueta inglés y el dataset de entrenamiento está en ese idioma.
- No dispone de visión, audio, modo thinking explícito ni decodificación especulativa documentada.

## Casos de uso

- Prototipado de agentes con tool calling en local: el adaptador permite experimentar con un bucle de agente y esquemas de funciones en inglés sobre una GPU de gama baja o incluso CPU, validando el diseño de herramientas antes de escalar a un modelo mayor.
- Enrutamiento de funciones con abstención: útil en asistentes que ofrecen un catálogo cerrado de herramientas y deben responder "no puedo hacer eso" cuando la petición queda fuera del catálogo, gracias al 67,74 % de acierto en el conjunto de irrelevancia.
- Generación de JSON estructurado para integraciones: el ajuste con GRPO sobre datos de tool calling mejora la fidelidad del nombre de función (91,91 %), lo que sirve para pipelines que convierten lenguaje natural en llamadas a API internas.
- Evaluación y docencia sobre RL: al partir del modelo base y publicar las métricas de ambos checkpoints, es un banco de pruebas reproducible para estudiar el efecto de GRPO en modelos pequeños y en tareas de formato estricto.
- Filtrado y clasificación de intenciones: el modelo puede clasificar una consulta y emitir una llamada de herramienta concreta, lo que permite construir un router ligero previo a un modelo mayor y reducir coste por consulta.
- Despliegue en edge o entornos sin GPU dedicada: con ~0,5 B de parámetros, cabe en dispositivos con poca memoria para tareas de extracción de argumentos o generación de llamadas simples, siempre que el idioma sea inglés y la latencia no sea crítica.
- Base para ajustes posteriores: sirve como punto de partida (o como referencia negativa) en experimentos de RL sobre tool calling con presupuestos de cómputo mínimos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La primera fila es el modelo base original; la segunda, el adaptador GRPO. Todos los valores son porcentajes. Las métricas xLAM se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04 % | 15,80 % | 26,80 % | 63,84 % | 90,03 % | 50,28 % | 77,78 % | 66,93 % | — |
| GRPO (este adaptador) | GRPO 660 | 42,20 % | 14,00 % | 25,69 % | 65,85 % | 91,91 % | 49,77 % | 77,78 % | 67,74 % | 0,5 |

Lectura de los datos: la mejora se concentra en las métricas de tool calling (+2,01 puntos en ETC, +1,88 en FNA, +0,81 en irrelevancia), mientras que MATH-500 cae 1,80 puntos, IFEval baja 1,11 puntos y BFCL single-turn FC retrocede 0,51 puntos. MMLU y Relevance permanecen prácticamente planos. El autor advierte que BFCL single-turn FC y las métricas de relevancia son agregados propios sobre subconjuntos seleccionados, no los valores oficiales del benchmark completo.

## Requisitos de hardware

- VRAM en fp16: aproximadamente 1 GB para el modelo base de 0,49 B más el overhead del adaptador y del contexto; cabe en cualquier GPU consumer de los últimos diez años.
- VRAM en 4 bits: por debajo de 0,5 GB, viable en iGPU, Raspberry Pi 5 con 8 GB y dispositivos móviles de gama alta.
- GPU recomendadas: ninguna en particular; RTX 3060/4060, T4, L4 o incluso CPU son suficientes. Para entrenamiento del adaptador con GRPO, una única GPU consumer con 8-16 GB basta, dado el tiempo declarado de 0,5 horas.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), fusión de pesos y exportación a GGUF para `llama.cpp` u `Ollama`, `vLLM` con soporte de adaptadores LoRA en runtime, y TGI con adaptadores. Verificar la compatibilidad de la conversión LoRA→GGUF antes de producción.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el del bucle de entrenamiento (0,5 h), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GRPO 660 sobre Qwen2.5-0.5B-Instruct) | ~0,49 B + LoRA | 32.768 (según base) | xLAM ETC 65,85 %, FNA 91,91 %, BFCL 49,77 % | No disponible | HuggingFace, adaptador PEFT |
| Qwen2.5-0.5B-Instruct (base) | ~0,49 B | 32.768 | xLAM ETC 63,84 %, FNA 90,03 %, BFCL 50,28 % | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | No disponible en la información proporcionada | Apache-2.0 | HuggingFace |
| Salesforce xLAM-1B-fc-r | ~1 B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |

La comparación directa con el base es la más informativa: el adaptador mejora la exactitud de llamada y de nombre de función a costa de un ligero retroceso en seguimiento de instrucciones y matemáticas. Frente a alternativas de mayor tamaño, la elección depende del presupuesto de memoria; no hay datos públicos en esta ficha para comparar rendimiento con xLAM-1B-fc-r o Qwen2.5-1.5B-Instruct en los mismos conjuntos.

## Limitaciones y advertencias

- Solo inglés declarado: el dataset de entrenamiento y la etiqueta de idioma son `en`; el rendimiento en castellano no está evaluado y previsiblemente será pobre en tool calling.
- Modelo muy pequeño: MATH-500 al 14,00 % e IFEval estricto al 25,69 % indican razonamiento matemático y seguimiento de instrucciones frágiles; no es apto para tareas de razonamiento multi-paso complejo.
- Riesgo alto de alucinación: con 0,49 B de parámetros, la generación libre de texto puede inventar argumentos, nombres de función o contenido factual aunque el formato JSON sea correcto.
- BFCL ligeramente peor que el base (49,77 % frente a 50,28 %): la mejora no es uniforme en todos los benchmarks de function calling, y los agregados son propios del autor, no puntuaciones oficiales.
- Licencia no declarada en la model card: antes de uso comercial hay que verificar los términos del adaptador y, en todo caso, respetar la licencia Apache-2.0 del modelo base Qwen2.5-0.5B-Instruct.
- Requiere cargar el modelo base por separado: el repositorio solo contiene pesos de adaptador (tamaño ~0,0 GB); no es un modelo autónomo y no funcionará sin `Qwen/Qwen2.5-0.5B-Instruct`.
- Sesgos no evaluados: no se publican análisis de sesgo, toxicidad ni evaluación de seguridad; el ajuste con recompensas de formato puede reforzar respuestas esquemáticas y poco naturales.
- Sin datos de reproducibilidad completos: no se especifican hiperparámetros LoRA, función de recompensa, semilla ni composición exacta del dataset, lo que dificulta replicar el resultado.
- Advertencia de producción: las métricas proceden de scripts propios y de subconjuntos seleccionados; conviene revalidar con el harness oficial de BFCL antes de cualquier despliegue.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo660-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab (scripts de entrenamiento y evaluación): https://github.com/uygarkurt/post-training-lab
