# tyrant35/zils-flash-fe

## Resumen

zils-flash-fe es un fine-tune de decisión publicado por el usuario tyrant35 sobre el chasis z3-flash (identificado en la model card como vllm-sr/d3-flash), cuyo modelo padre es Qwen/Qwen3.5-9B. El modelo tiene 8.392.695.024 parámetros y un repositorio de 16,8 GB en formato safetensors. Su propósito declarado es actuar como "soup-pool body" de la familia Zils d3-flash: un modelo orientado a tareas de clasificación y decisión sobre prompts estructurados, no a generación abierta de texto.

Técnicamente se construye promediando dos fine-tunes LoRA de rango 32 (semillas 1 y 2, learning rate 2e-4) aplicados sobre el chasis original. El entrenamiento combina datos públicos de diez benchmarks de decisión (iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, HellaSwag, WinoGrande, CLINC150 y BANKING77) con las propias probabilidades del chasis sobre 6.000 prompts de decisión, buscando preservar el comportamiento previo del modelo base.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos especializados en "decidir" (clasificar, verificar, responder entre opciones) derivados de LLMs generalistas mediante mezcla de adaptadores, con licencia Apache 2.0. No obstante, la información publicada es muy escasa: no hay benchmarks, no se declaran idiomas y el modelo no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B; detalles internos no disponibles) |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-9B, un transformer de aproximadamente 8,4 mil millones de parámetros. Sobre ese chasis (denominado z3-flash / vllm-sr/d3-flash) se aplicaron dos fine-tunes LoRA de rango 32 con semillas 1 y 2 y learning rate 2e-4, cuyos pesos resultantes se promediaron para formar el modelo final ("soup-pool"). No se documentan detalles sobre atención, tipo de positional encoding ni longitud de contexto efectiva.

El entrenamiento usó exclusivamente splits de train públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, HellaSwag, WinoGrande, CLINC150 y BANKING77, más los splits de desarrollo de VAST y NLI4CT. Los objetivos de entrenamiento mezclan la etiqueta gold (peso 0,5) con las probabilidades del propio chasis (peso 0,5), y se añadieron 6.000 prompts de decisión públicos con las probabilidades del chasis como objetivo auxiliar para preservar el comportamiento original. Según el autor, no se utilizó ningún split de test de benchmark. No se menciona RLHF, DPO ni número total de tokens de entrenamiento.

## Capacidades

- Clasificación y decisión sobre prompts estructurados: el modelo está entrenado para emitir probabilidades o etiquetas en tareas de elección entre opciones.
- Detección de sarcasmo y análisis de sentimiento (iSarcasmEval, VAST).
- Razonamiento lógico y encadenado (CLadder).
- Verificación de afirmaciones clínicas y evidence-based reasoning (NLI4CT, HoVer).
- Clasificación de intenciones y consultas de atención al cliente (CLINC150, BANKING77).
- Búsqueda y relevancia de productos en e-commerce (Amazon ESCI).
- Razonamiento de sentido común y elección entre alternativas (HellaSwag, WinoGrande).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de opiniones y detección de sarcasmo en foros: el modelo puede clasificar comentarios según las categorías de iSarcasmEval, aprovechando el fine-tune específico sobre ese dataset para etiquetar ironía y sarcasmo en texto de usuario.
- Enrutamiento de tickets de soporte: entrenado con CLINC150 y BANKING77, puede asignar consultas de clientes a intenciones predefinidas (pagos, tarjetas, cuentas) con una taxonomía cerrada y consistente.
- Verificación de afirmaciones en dominios científicos y clínicos: gracias a NLI4CT y HoVer, puede evaluar si una evidencia respalda o refuta una afirmación, útil en pipelines de fact-checking automatizado.
- Relevancia de productos en buscadores de e-commerce: con Amazon ESCI puede puntuar la relación entre consulta y producto (exacta, sustituta, complementaria, irrelevante) para reordenar resultados.
- Evaluación de razonamiento en asistentes educativos: el fine-tune sobre CLadder permite comprobar si una cadena de razonamiento lógico llega a la conclusión correcta, como paso de validación en sistemas de tutoría.
- Clasificación de sentido común para filtrado de datos: usando HellaSwag y WinoGrande, puede descartar continuaciones incoherentes en pipelines de curación de datasets o generación aumentada.
- Control de calidad en atención al cliente: puede actuar como clasificador de segunda opinión que valida la intención detectada por un modelo generativo mayor, reduciendo errores de enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1 ni comparaciones numéricas con el chasis original ni con Qwen/Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8,5-9 GB de pesos, con margen práctico de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,5-5 GB de pesos, con margen práctico de 8-10 GB.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB.
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 con contexto moderado; en RTX 3090 (24 GB) también, con menor margen. En GPUs de 16 GB (RTX 4080, 4070 Ti Super) requiere cuantización de 8 bits; en 8-12 GB (RTX 4060 Ti, 4070) requiere 4 bits.
- Opciones de despliegue: vLLM y TGI para safetensors en fp16; llama.cpp y Ollama requerirían conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-flash-fe | 8,39 B | no disponible | Clasificación/decisión (fine-tune) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9 B (según nombre) | no disponible | LLM generativo generalista | no disponible en la información | Hugging Face |
| z3-flash (vllm-sr/d3-flash) | no disponible | no disponible | Chasis de decisión Zils | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks ni métricas de evaluación; el rendimiento real en las tareas declaradas es desconocido.
- El modelo está entrenado para decisiones sobre opciones cerradas; no está pensado para generación abierta de texto y puede degradarse en ese uso.
- Riesgo de alucinación: no evaluado; al derivar de un LLM generativo, puede producir justificaciones plausibles pero incorrectas si se usa fuera del formato de decisión.
- Sesgos conocidos: no documentados; los datasets de entrenamiento (iSarcasmEval, CLINC150, etc.) tienen dominios y distribuciones específicas que pueden introducir sesgos de dominio e idioma.
- Idiomas: no se declara ningún idioma soportado; el uso en castellano no está garantizado.
- Longitud de contexto: no documentada; no se debe asumir la del modelo base sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (22 de noviembre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- El nombre del modelo base (Qwen3.5-9B) no se corresponde exactamente con el número de parámetros real (8,39 B), por lo que la nomenclatura puede ser aproximada.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-flash-fe
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Chasis referenciado en la model card: vllm-sr/d3-flash (no se proporciona URL)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
