# wwwcomcom/ko-morph-qwen2.5-0.5b-instruct

## Resumen

ko-morph-qwen2.5-0.5b-instruct es un modelo de generación de texto en coreano publicado por el usuario wwwcomcom en HuggingFace. Se trata de un ajuste por instrucciones (SFT) del modelo wwwcomcom/ko-morph-qwen2.5-0.5b-cpt, que a su vez es un Qwen2.5-0.5B sometido a preentrenamiento continuado (CPT) con unos 2,5 B de tokens de texto coreano y un tokenizador de morfemas en lugar del BPE original. El resultado es un modelo decoder-only tipo Qwen2 con 386.570.112 parámetros reales en safetensors, licencia Apache 2.0 y un único idioma soportado: el coreano.

La peculiaridad técnica del proyecto es el tokenizador morfológico, que segmenta el coreano en unidades con significado gramatical en lugar de subpalabras estadísticas. El autor evalúa el efecto de ese cambio comparando contra un Qwen2.5-0.5B de base entrenado con exactamente el mismo SFT y el mismo subconjunto de datos, y obtiene una ventaja clara en gramática (327/334 frente a 293/334 en pares mínimos, con p de McNemar de 1,95×10⁻⁸). El propio autor advierte que ese resultado no permite separar el efecto del tokenizador del efecto del CPT, porque no existe un grupo de control con BPE y el mismo CPT.

Es relevante ahora como caso de estudio reproducible de tokenización morfológica aplicada a un modelo pequeño, no como modelo de producción. El ajuste se hizo sobre 21.067 ejemplos de KoAlpaca-v1.1a, con formato de prompt sin saltos de línea, y el modelo presenta olvido catastrófico en aritmética y lógica formal respecto al Qwen2.5 original. El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (según el tag `qwen2`), con tokenizador de morfemas para coreano |
| Parámetros totales | 386.570.112 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor solo publica safetensors; no declara GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 (transformer decoder-only) del checkpoint base Qwen2.5-0.5B, sobre el que se aplicó un preentrenamiento continuado en coreano con un tokenizador de morfemas. Este CPT dio lugar a wwwcomcom/ko-morph-qwen2.5-0.5b-cpt, del que ko-morph-qwen2.5-0.5b-instruct es el ajuste por instrucciones. Una consecuencia medible del cambio de tokenizador es el recuento de parámetros: 386.570.112 en lugar del tamaño habitual de la familia Qwen2.5-0.5B, al variar el vocabulario de embeddings.

El SFT se realizó sobre el dataset beomi/KoAlpaca-v1.1a (preguntas de 지식iN con respuestas generadas por GPT), usando únicamente los 21.067 ejemplos (99,6 %) que forman la intersección con el conjunto del modelo de control, para evitar contaminar el entrenamiento por las diferencias de longitud entre tokenizadores. La configuración fue: secuencia de 768 tokens, micro-batch de 4, acumulación de 4, 3 épocas, learning rate 2e-5 y enmascaramiento del prompt (la pérdida se calcula solo sobre la respuesta). El formato de prompt es `### 질문: {instruction} ### 답변: {output}` y, de forma crítica, no contiene saltos de línea porque el tokenizador no puede codificar el carácter `\n`.

No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineación posterior al SFT supervisado. Tampoco se detalla la composición exacta del corpus de CPT más allá de que es texto web coreano de unos 2,5 B de tokens.

## Capacidades

- Generación de texto en coreano con formato fijo de una sola línea: `### 질문: ... ### 답변: ...`.
- Seguimiento de instrucciones sencillas en coreano gracias al SFT sobre KoAlpaca-v1.1a.
- Modelado a nivel morfológico del coreano, lo que favorece tareas de análisis y segmentación de palabras.
- Juicio de gramaticalidad: 327 aciertos sobre 334 pares mínimos en la evaluación del autor.
- Respuestas cortas de conocimiento y sentido común en coreano: en la evaluación de 8 preguntas obtuvo 3 correctas, 3 parciales y 2 incorrectas.
- Razonamiento general limitado: 2 respuestas correctas y 1 parcial sobre 10 preguntas.
- Soporte de tool calling / function calling: no disponible (no se documenta plantilla de herramientas ni tokens especiales para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, el modelo está entrenado y evaluado únicamente en coreano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Generación de texto largo o con formato enriquecido: no viable, el tokenizador no codifica saltos de línea ni se ha entrenado con ChatML.

## Casos de uso

- Clasificación y etiquetado de texto coreano: con prompts de una sola línea del tipo `### 질문: 다음 문장의 감정을 분류하세요: ... ### 답변:` el modelo puede devolver una categoría corta; es adecuado porque el formato coincide exactamente con el de entrenamiento.
- Análisis morfológico y segmentación: el tokenizador de morfemas permite estudiar cómo se descompone el coreano en unidades gramaticales, útil para construir o validar analizadores morfológicos en investigación.
- Respuestas cortas de FAQ en coreano: para preguntas frecuentes con respuesta de una o dos frases, el modelo cabe en cualquier GPU y responde con baja latencia.
- Enrutado o filtrado previo en pipelines de PLN coreano: usar el modelo como clasificador barato que decide si una consulta va a un modelo mayor; su tamaño de 386 M de parámetros hace que el coste por consulta sea mínimo.
- Evaluación de gramaticalidad en herramientas de corrección: los 327/334 en pares mínimos lo hacen utilizables como puntuador de aceptabilidad en correctores de coreano.
- Investigación sobre tokenización: sirve como punto de comparación frente al mismo SFT sobre Qwen2.5-0.5B con BPE, replicando el experimento del autor para aislar el efecto del tokenizador.
- Despliegue en entornos sin GPU o en el borde: con pesos en fp16 de aproximadamente 0,77 GB puede ejecutarse en CPU o en dispositivos embebidos para tareas de generación muy corta.
- Generación de conjuntos de datos sintéticos en coreano: producir pares pregunta-respuesta breves y de una línea para aumento de datos, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando contra un Qwen2.5-0.5B de base sometido exactamente al mismo SFT:

| Evaluación | ko-morph-qwen2.5-0.5b-instruct | Qwen2.5-0.5B con SFT idéntico |
|---|---|---|
| Pares mínimos gramaticales (334 pares) | 327/334 (97,9 %) | 293/334 (87,7 %) |
| Conocimiento y sentido común en coreano (8 preguntas) | 3 correctas / 3 parciales / 2 incorrectas | 8 incorrectas |
| Razonamiento general (10 preguntas) | 2 correctas / 1 parcial | 3 correctas |

La diferencia en gramática es estadísticamente significativa según el test de McNemar aplicado por el autor (p = 1,95×10⁻⁸). El propio autor advierte que no puede atribuirse con certeza al tokenizador de morfemas, porque falta un grupo de control con BPE y el mismo CPT. En aritmética y lógica formal el modelo pierde frente al Qwen2.5 original (por ejemplo, falla en `300×4=1200`), lo que el autor interpreta como indicio de olvido catastrófico tras el CPT con texto web coreano.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,77 GB en fp16 (386,57 M de parámetros × 2 bytes) y alrededor de 0,39 GB en int8 o 0,19 GB en int4, sin contar caché KV ni activaciones. El repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior lo ejecuta con holgura. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales e incluso en iGPU con memoria compartida.
- Cabe en CPU: sí, la inferencia en CPU es viable para generaciones cortas de una línea.
- Opciones de despliegue: el autor solo documenta el uso con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`, con `dtype=torch.float16`). No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados, por lo que esas rutas no están verificadas.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| wwwcomcom/ko-morph-qwen2.5-0.5b-instruct | 386,57 M | no disponible | coreano | Apache 2.0 | Objeto de esta ficha; SFT sobre 21.067 ejemplos de KoAlpaca-v1.1a |
| wwwcomcom/ko-morph-qwen2.5-0.5b-cpt | no disponible | no disponible | coreano | no disponible | Modelo base del anterior; CPT de unos 2,5 B de tokens con tokenizador de morfemas |
| Qwen2.5-0.5B con SFT idéntico (control del autor) | no disponible | no disponible | coreano | Apache 2.0 (modelo Qwen original) | 293/334 en gramática y 8/8 errores en conocimiento coreano; sirve de referencia directa |
| Qwen2.5-0.5B-Instruct | no disponible | no disponible | multilingüe | Apache 2.0 | El autor desaconseja explícitamente la comparación, porque su SFT usa datos privados a gran escala |

No se dispone de datos suficientes sobre parámetros y contexto de los modelos de comparación en la información proporcionada.

## Limitaciones y advertencias

- El tokenizador no puede codificar saltos de línea. Cualquier prompt con `\n` o en formato ChatML degrada el rendimiento, porque el modelo no los ha visto en entrenamiento.
- No existe plantilla de chat oficial; hay que respetar literalmente el formato `### 질문: {instruction} ### 답변:`.
- La ventaja en gramática no está aislada: el autor reconoce que no hay grupo de control con BPE y el mismo CPT, por lo que no puede atribuirse solo al tokenizador de morfemas.
- Olvido catastrófico documentado en aritmética y lógica formal respecto al Qwen2.5 original, tras el CPT con texto web coreano.
- Riesgo de alucinación apreciable en conocimiento factual: en la evaluación de 8 preguntas de conocimiento y sentido común en coreano, 2 fueron incorrectas y 3 solo parciales.
- Los datos de SFT son respuestas generadas por GPT en KoAlpaca-v1.1a, por lo que el modelo hereda los sesgos y errores de ese corpus sintético.
- Idiomas: solo coreano. No se ha entrenado ni evaluado en castellano ni en otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar tareas que dependan de ventanas largas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de Qwen2.5-0.5B y conviene revisar también los términos del modelo original.
- Validación nula por parte de la comunidad: 0 descargas y 0 likes en el momento del análisis, sin pruebas independientes que reproduzcan los resultados.
- No está pensado para producción sin una evaluación propia: el autor insiste en no compararlo con Qwen2.5-0.5B-Instruct, cuyo SFT es de escala muy superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wwwcomcom/ko-morph-qwen2.5-0.5b-instruct
- Modelo base (CPT): https://huggingface.co/wwwcomcom/ko-morph-qwen2.5-0.5b-cpt
- Dataset de SFT: https://huggingface.co/datasets/beomi/KoAlpaca-v1.1a
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los únicos resultados obtenidos corresponden a centros educativos alemanes sin relación con el tema.
