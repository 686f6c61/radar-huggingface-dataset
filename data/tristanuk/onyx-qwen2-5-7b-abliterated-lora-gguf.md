# TristanUK/onyx-qwen2.5-7b-abliterated-lora-GGUF

## Resumen

onyx-qwen2.5-7b-abliterated-lora-GGUF es una distribución en formato GGUF de un ajuste fino LoRA sobre Qwen2.5-7B-Instruct abliterated v2, publicada por el usuario TristanUK. Mantiene la arquitectura transformer decoder-only densa de la familia Qwen2.5, con 7.615.616.512 parámetros (7,62 B), y se distribuye cuantizado en Q4_K_M dentro de un repositorio de 4,7 GB. El término "abliterated" indica que se ha eliminado la dirección de rechazo del modelo base, de forma que responde a peticiones que el original declinaría; "onyx" es el nombre del fine-tune.

El interés práctico es acotado pero claro: permite ejecutar un modelo de 7 B sin los filtros del instruct original en hardware de consumo mediante llama.cpp u Ollama, con un único archivo GGUF listo para usar y plantilla de chat Jinja. La model card es mínima: no declara licencia, idiomas, longitud de contexto, dataset de entrenamiento ni resultados de evaluación, y el repositorio acumula cero descargas y cero valoraciones.

Por tanto, debe tratarse como un artefacto experimental sin validación comunitaria. Su utilidad real está en experimentación con modelos sin censura, generación de datos adversariales y prototipado local, no en despliegues de producción sin auditoría previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2); fine-tune LoRA sobre Qwen2.5-7B-Instruct abliterated v2 |
| Parámetros totales | 7.615.616.512 (7,62 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No declarada en la model card; la arquitectura base Qwen2.5-7B soporta hasta 131.072 tokens |
| Tipos de cuantización | Q4_K_M (único archivo publicado: `Qwen2.5-7B-Instruct-abliterated-v2.Q4_K_M.gguf`) |
| Idiomas soportados | No disponibles; se heredan los de Qwen2.5 (29 idiomas según la documentación oficial), sin verificar tras el fine-tune |
| Licencia | No disponible en la model card; el modelo base Qwen2.5-7B se publica bajo Apache 2.0 |
| Formato de pesos | GGUF (convertido con Unsloth) |
| Tamaño del repositorio | 4,7 GB |
| Etiquetas declaradas | gguf, qwen2, llama.cpp, unsloth, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

La base es Qwen2.5-7B-Instruct, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con grouped-query attention (GQA). Sobre esa base se aplicó primero una "abliteración" (v2), técnica que identifica la dirección latente asociada al rechazo y la proyecta fuera de las activaciones, de modo que el modelo pierde el comportamiento de negativa aprendido en el alignment. Después se entrenó un adaptador LoRA, presumiblemente para darle el carácter "onyx", aunque la model card no describe el dataset, el número de pasos ni la composición de los datos.

La conversión a GGUF se realizó con Unsloth, que según la propia card permitió entrenar "2x más rápido". No se documenta el número de tokens de entrenamiento del fine-tune, ni si hubo RLHF/DPO adicional, ni el proceso exacto de fusión del adaptador. La familia Qwen2.5 se preentrenó sobre 18 billones de tokens según la documentación oficial de Qwen, dato que aplica solo al modelo base y no a este derivado. No hay información sobre decodificación especulativa ni optimizaciones de atención específicas del fine-tune.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat Jinja compatible con `llama-cli --jinja`.
- Razonamiento general y resolución de problemas de nivel 7 B, heredado de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas: Qwen2.5-7B-Instruct es competitivo en HumanEval y GSM8K, aunque no hay evaluación de este derivado.
- Multilingüismo potencial (29 idiomas en la base), sin verificar tras la abliteración y el LoRA.
- Respuestas sin rechazo: no activa negativas de seguridad ante contenido sensible, que es precisamente el objetivo de la abliteración.
- Soporte de contexto largo potencial (hasta 131.072 tokens en la arquitectura base), sujeto a la configuración de RoPE del GGUF.
- Compatibilidad con llama.cpp, Ollama y otros runners GGUF; la etiqueta `endpoints_compatible` sugiere uso previsto vía API compatible con endpoints.
- No dispone de visión, audio ni otras modalidades; es un modelo exclusivamente de texto.

## Casos de uso

- **Roleplay y ficción sin restricciones**: el modelo no bloquea temáticas adultas o violentas, por lo que se usa en comunidades de escritura creativa y juegos de rol. Requiere revisión humana del contenido generado.
- **Red teaming y generación de datos adversariales**: útil para producir prompts y respuestas que un modelo alineado rechazaría, y así entrenar clasificadores de seguridad o evaluar filtros de moderación.
- **Investigación sobre alineación y rechazo**: permite comparar el comportamiento del modelo abliterado frente al Qwen2.5-7B-Instruct original para estudiar qué se pierde y qué se gana al eliminar la dirección de negativa.
- **Asistente local offline**: con 4,7 GB de pesos Q4_K_M cabe en un portátil con GPU de 8 GB o en CPU con 8 GB de RAM, sin enviar datos a ningún servicio externo.
- **Prototipado de chatbots con plantilla Jinja**: `llama-server` o `llama-cli --jinja` permiten levantar un endpoint compatible con OpenAI en minutos para validar una idea de producto.
- **Generación de datos sintéticos en castellano**: puede utilizarse para crear corpus de entrenamiento o de aumento de datos, siempre con revisión posterior por el riesgo de alucinación y sesgos.
- **Evaluación comparativa de cuantizaciones**: sirve como banco de pruebas para medir la degradación de Q4_K_M frente a otros niveles en tareas de razonamiento y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se han evaluado los efectos de la abliteración sobre el rendimiento cognitivo del modelo. Cualquier cifra que se cite para este modelo concreto sería una extrapolación no verificada.

## Requisitos de hardware

- **VRAM estimada**: los pesos Q4_K_M ocupan 4,7 GB; con caché KV para 8.000 tokens de contexto se estiman 6-8 GB de VRAM. Para contextos cercanos a 32.000 tokens, 10-12 GB.
- **GPU de consumo**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB funciona con contexto reducido.
- **GPU profesionales**: L4, A10G y RTX A5000 son suficientes; A100 y H100 quedan sobredimensionadas para 7 B en Q4.
- **CPU**: viable con llama.cpp y al menos 8 GB de RAM; el throughput será notablemente inferior al de GPU (no se han publicado medidas).
- **Despliegue**: `llama-cli -hf TristanUK/onyx-qwen2.5-7b-abliterated-lora-GGUF --jinja`, `llama-server`, Ollama (importando el GGUF con un Modelfile), LM Studio, llama-cpp-python. vLLM solo con soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- **Latencia y throughput**: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Evaluación publicada |
|---|---|---|---|---|---|
| onyx-qwen2.5-7b-abliterated-lora (este) | 7,62 B | No declarado (base: 131.072) | No disponible | GGUF Q4_K_M | Ninguna |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 | Apache 2.0 | Safetensors, GGUF | Sí, en la model card oficial |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | Safetensors, GGUF | Sí, en la model card oficial |
| Mistral 7B Instruct v0.3 | 7,24 B | 32.768 | Apache 2.0 | Safetensors, GGUF | Sí, en la model card oficial |

Frente a las alternativas, este modelo se diferencia por la abliteración y por el fine-tune LoRA, no por capacidades técnicas superiores. Qwen2.5-7B-Instruct y Mistral 7B v0.3 ofrecen licencias claras para uso comercial; Llama 3.1 8B impone restricciones de la licencia comunitaria. La ausencia de evaluación impide afirmar que este derivado conserve el rendimiento del base.

## Limitaciones y advertencias

- **Contenido dañino**: la abliteración elimina el comportamiento de rechazo, por lo que el modelo puede generar instrucciones peligrosas, contenido violento, sexual explícito o discurso de odio. No es apto para aplicaciones de cara al público sin un filtro externo.
- **Alucinación**: típica de modelos de 7 B, agravada por la falta de evaluación específica tras el fine-tune.
- **Licencia incierta**: la model card no declara licencia. Aunque la base sea Apache 2.0, los términos del derivado no están claros, lo que supone un riesgo legal para uso comercial.
- **Sin validación comunitaria**: cero descargas y cero valoraciones; no hay evidencia de que el modelo funcione según lo esperado.
- **Metadatos inconsistentes**: la fecha de creación registrada es 2026-10-22 (futura) y el recuento de parámetros procede de safetensors aunque el repositorio solo contiene GGUF.
- **Idiomas no verificados**: no se confirma el rendimiento en castellano ni en los 29 idiomas teóricos de la base tras la abliteración.
- **Contexto efectivo incierto**: el GGUF puede requerir configuración manual de RoPE para aprovechar los 131.072 tokens; con Q4_K_M la ventana práctica suele ser menor.
- **Una sola cuantización**: solo se publica Q4_K_M, sin alternativa en FP16, Q8_0 o Q5_K_M para comparar degradación.
- **Sin soporte multimodal ni tool calling verificado**: no hay evidencia de que las capacidades de function calling de Qwen2.5-Instruct sobrevivan al proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TristanUK/onyx-qwen2.5-7b-abliterated-lora-GGUF
- Unsloth (framework de entrenamiento y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Qwen2.5-7B-Instruct (modelo base): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
