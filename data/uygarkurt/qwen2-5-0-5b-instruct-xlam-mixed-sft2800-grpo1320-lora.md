# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo1320-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo1320-lora` es un adaptador LoRA de 0,5 mil millones de parámetros construido sobre `Qwen/Qwen2.5-0.5B-Instruct` y especializado en *tool calling* estructurado y en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta. Lo publica el desarrollador uygarkurt dentro de su proyecto Post-Training Lab, y su interés radica en que documenta un pipeline completo de posentrenamiento (SFT seguido de GRPO) sobre un modelo deliberadamente pequeño, con métricas por etapa y tiempos de entrenamiento desglosados.

El adaptador no se entrena desde cero: continúa un adaptador SFT previo del mismo autor tras 2.800 actualizaciones de *supervised fine-tuning* y 1.320 actualizaciones de *Group Relative Policy Optimization* sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`. El resultado es un incremento medible en precisión de llamadas a herramientas (xLAM ETC de 73,72% a 76,17%, BFCL single-turn de 51,76% a 54,78%) a costa de una ligera caída en MMLU y MATH-500.

Su relevancia práctica es la de un modelo de juguete serio: sirve para validar recetas de RL aplicadas a function calling, para enrutado de herramientas de baja latencia en *edge* y como referencia reproducible de que GRPO puede mejorar la calibración de abstención (relevancia/irrelevancia) sin reentrenar el modelo base completo. El contexto, la tokenización y el resto de especificaciones heredan del Qwen2.5-0.5B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | ~0,49 B en el modelo base; el adaptador LoRA añade un subconjunto de pesos de bajo rango (rango no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; no especificado en la model card del adaptador |
| Tipos de cuantizacion | no disponible en el repositorio (los pesos se distribuyen como adaptador LoRA en safetensors; puede fusionarse con el base y cuantizarse a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (declarado); el modelo base Qwen2.5 declara soporte multilingüe, no verificado para este adaptador |
| Licencia | no disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen2.5-0.5B-Instruct |
| Libreria | peft, transformers |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Relacion con el base | base_model_relation: adapter |
| Fecha de publicacion | 2026-10-25 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de la familia Qwen2.5, con las innovaciones habituales de esa generación en el base (RoPE, SwiGLU, RMSNorm, atención con query-key-value bias y GQA). El adaptador no modifica la arquitectura ni el tokenizador: se inyecta en las capas del base y se distribuye como pesos PEFT, de modo que para inferencia hay que cargar `Qwen/Qwen2.5-0.5B-Instruct` y superponer el adaptador (el adaptador SFT previo no es necesario por separado).

El entrenamiento se hizo en dos fases con Post-Training Lab sobre el dataset mixto de tool calling: 2.800 actualizaciones de SFT (0,4 h) seguidas de 1.320 actualizaciones de GRPO (0,7 h), con un total de 1,1 h de bucle de entrenamiento, excluyendo carga de modelo, preparación de datos y evaluación externa. El objetivo declarado de la fase GRPO es doble: reforzar el formato estructurado de las llamadas y aprender a abstenerse cuando el conjunto de herramientas ofrecido es irrelevante. No se documentan en la model card el número de tokens vistos, la composición exacta del dataset, la configuración del reward ni hiperparámetros de LoRA.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling / function calling estructurado: emisión de llamadas con nombre de función y argumentos en formato parseable.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente en la fase GRPO para no forzar una llamada cuando ninguna herramienta encaja.
- Precisión de nombre de función muy alta (xLAM FNA 96,02% en el holdout de evaluación), lo que facilita el enrutado a APIs concretas.
- Razonamiento básico y matemáticas elementales: medidas en MMLU (39,67%) y MATH-500 (17,60%), con valores propios de un modelo de 0,5 B.
- Seguimiento de instrucciones con formato estricto: IFEval 30,31% a nivel de prompt (strict accuracy).
- Capacidad de operar como cabecera de decisión en pipelines de agentes de un solo paso (selección de herramienta y argumentos), no como planificador multi-paso complejo.
- Capacidades multimodales, de audio o de *thinking mode*: no disponibles.

## Casos de uso

- **Enrutado de herramientas de baja latencia en el edge**: el adaptador elige la función correcta entre un catálogo pequeño y genera los argumentos; con 0,5 B de parámetros puede ejecutarse en CPU o en GPU integrada dentro del propio servicio, evitando una llamada de red a un modelo mayor para una decisión de clasificación.
- **Filtro de abstención en pipelines de agentes**: al estar entrenado para detectar irrelevancia, puede colocarse como primera etapa que decide si merece la pena invocar herramientas; si ninguna encaja, devuelve abstención y se evita una llamada errónea a una API con efectos secundarios.
- **Prototipado rápido de recetas de RL para function calling**: sirve como banco de pruebas reproducible de SFT + GRPO con métricas por etapa (ETC, FNA, BFCL, relevancia), útil para investigadores que quieran validar una configuración de reward antes de escalarla a modelos de 7 B o superiores.
- **Generación de esquemas de llamada en asistentes de documentación técnica**: dado un conjunto de funciones descritas en JSON Schema, el modelo produce la llamada correspondiente a una consulta en inglés, aprovechable para autogenerar ejemplos de uso o tests de integración de APIs.
- **Normalización de lenguaje natural a consultas de backend**: conversión de peticiones de usuario en llamadas a endpoints internos (búsqueda, gestión de tickets, consulta de estado) en aplicaciones donde el coste por inferencia debe ser mínimo.
- **Evaluación comparativa de adaptadores**: al publicar el adaptador SFT previo y el SFT+GRPO con las mismas métricas, permite medir el efecto aislado de GRPO en un caso controlado, por ejemplo en un artículo o en una revisión interna de metodología.
- **Sustituto ligero en tests de integración de agentes**: usar el adaptador como *stub* determinista y barato de un agente real en CI, verificando el parseo de llamadas y el manejo de abstenciones sin consumir cuotas de modelos grandes.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las cifras son porcentajes; la primera fila es el adaptador SFT usado para inicializar GRPO y la segunda el adaptador actual.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 2.800 | 39,80 | 18,40 | 29,57 | 73,72 | 95,89 | 51,76 | 83,33 | 58,83 | 0,4 |
| SFT + GRPO (este adaptador) | GRPO 1.320 | 39,67 | 17,60 | 30,31 | 76,17 | 96,02 | 54,78 | 83,33 | 61,32 | 1,1 |

Notas metodológicas declaradas por el autor: xLAM ETC es exactitud exacta de la llamada; xLAM FNA es exactitud del nombre de función; ambas se calculan sobre el holdout *calls-only* con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM emplean scripts propios de Post-Training Lab, por lo que los agregados son específicos del estudio y no directamente comparables con tablas públicas.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 1 GB para los pesos del base más el adaptador, más caché KV; con 2 GB de VRAM libre se opera con comodidad para contextos moderados.
- Cuantizado a 4 bits (GGUF Q4 o similar, tras fusionar el adaptador con el base): aproximadamente 0,4-0,5 GB de pesos, viable en CPU con llama.cpp.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060/4060/4090, L4, T4 o incluso Apple Silicon mediante Metal. No requiere A100 ni H100.
- Cabe en GPU de gama baja, en iGPU y en dispositivos móviles de gama alta si se cuantiza; también en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers + peft (ruta nativa del adaptador), vLLM o TGI tras fusionar el adaptador en el base, llama.cpp/Ollama con un GGUF derivado, y servidores compatibles con la API de OpenAI para tool calling.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por petición corta en GPU y de decenas a centenares de milisegundos en CPU, sin cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | ~0,49 B + LoRA | 32.768 (heredado del base) | Entrenado explícitamente, con abstención | no disponible en la card | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | ~0,49 B | 32.768 | Capacidad genérica del base, sin especialización | Apache 2.0 | HuggingFace, ampliamente usado |
| Adaptador SFT previo del mismo autor | ~0,49 B + LoRA | 32.768 (heredado) | Sí, sin fase GRPO | no disponible en la card | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 | Capacidad genérica del base | Apache 2.0 | HuggingFace |

No se dispone de resultados de benchmarks del base sin ajuste ni de Qwen2.5-1.5B-Instruct en esta misma configuración de evaluación, por lo que la comparación cuantitativa de rendimiento entre filas no está disponible. La comparación de la tabla se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Tamaño muy reducido: MMLU 39,67% y MATH-500 17,60% sitúan el razonamiento y las matemáticas muy por debajo de modelos de 7 B o superiores; no es apto para tareas que exijan conocimiento factual amplio o cálculo no trivial.
- IFEval de 30,31% en exactitud estricta indica un seguimiento de instrucciones de formato frágil fuera del esquema de tool calling para el que fue entrenado.
- La tasa de irrelevancia (61,32%) sigue siendo baja en términos absolutos: aproximadamente cuatro de cada diez casos en ese subconjunto podrían producir una llamada cuando debería haber abstención, lo que es arriesgado en APIs con efectos secundarios.
- Idiomas: solo se declara inglés; no hay evidencia de que el ajuste preserve el multilingüismo del base, y el castellano no está evaluado.
- Riesgo de alucinación en argumentos: el adaptador puede generar nombres de parámetros o valores plausibles pero inexistentes si el esquema de herramientas es ambiguo; se recomienda validación con JSON Schema en producción.
- Métricas no comparables con tablas públicas: los agregados de BFCL y xLAM son específicos del estudio, con subconjuntos seleccionados y scripts propios, y el holdout excluye 700 ejemplos, lo que puede sesgar los resultados.
- Licencia del adaptador no disponible: antes de uso comercial hay que confirmar los términos con el autor, aunque el base Qwen2.5-0.5B-Instruct es Apache 2.0.
- Repositorio con 0 descargas y 0 likes, publicado el 2026-10-25: no hay validación independiente de las cifras reportadas.
- Requiere cargar el modelo base por separado; no es un checkpoint autónomo y debe fusionarse o superponerse correctamente antes de servirse con vLLM, TGI u Ollama.
- No se documentan hiperparámetros de LoRA, composición del dataset ni la función de recompensa de GRPO, lo que dificulta la reproducibilidad exacta del resultado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo1320-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab

No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo; los resultados obtenidos no guardan relación con él.
