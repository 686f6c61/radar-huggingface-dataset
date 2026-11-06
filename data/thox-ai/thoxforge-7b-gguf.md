# Thox-ai/ThoxForge-7B-GGUF

## Resumen

ThoxForge-7B-GGUF es el punto de distribución en formato GGUF del modelo ThoxForge-7B, un ajuste fino mediante LoRA (rango 8) del conocido `mistralai/Mistral-7B-Instruct-v0.3`, desarrollado por THOX.ai. El modelo está orientado a generación de código y texto general, y se distribuye principalmente para su uso local en hosts y máquinas edge dentro del ecosistema THOX (ThoxOS, MeshStack) o mediante Ollama.

Es importante señalar que este repositorio concreto no contiene pesos: actúa únicamente como punto de distribución de referencia. El único GGUF verificado (Q4_K_M, 4.372.812.160 bytes) y el adaptador LoRA (`adapter_model.safetensors`, 83.945.296 bytes) se alojan en el repositorio principal `Thox-ai/ThoxForge-7B`. El autor documenta explícitamente que una variante GGUF independiente fue construida y evaluada, pero se retiró sin publicar tras fallar la evaluación interna de datos corporativos (fabricó historial del fundador).

El modelo hereda la arquitectura y el contexto de Mistral-7B-Instruct-v0.3, con licencia Apache-2.0 tanto para la base como para el ajuste. No se publican resultados de benchmarks ni logs de entrenamiento, por lo que la evaluación de calidad queda enteramente en manos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Mistral-7B-Instruct-v0.3; el autor no la declara en esta card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico build verificado); adaptador LoRA en safetensors |
| Idiomas soportados | Ingles (declarado); calidad inferior en otros idiomas segun el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (adaptador LoRA); este repositorio solo contiene la model card |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de rango 8 sobre `mistralai/Mistral-7B-Instruct-v0.3`, por lo que conserva la arquitectura transformer decoder-only del modelo base, incluyendo su tokenizador y su ventana de contexto. No se introduce ninguna innovacion arquitectonica propia: el valor anadido reside en el adaptador de bajo rango y en el empaquetado para despliegue local.

El autor no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La card remite al repositorio principal para el registro completo del entrenamiento y no reclama ningun entrenamiento adicional para este repositorio. Tampoco se publican logs de entrenamiento ni artefactos de evaluacion, y no existe un resultado GATE49 publicado para ThoxForge-7B.

## Capacidades

- Generacion de texto general en ingles, con enfasis declarado en tareas orientadas a codigo.
- Generacion y asistencia en programacion, heredada del modelo base Mistral-7B-Instruct-v0.3.
- Instrucciones conversacionales (modelo de tipo instruct).
- Despliegue local sin cuenta en la nube mediante Ollama, llama.cpp o Transformers + PEFT.
- Integracion en el stack THOX: hosts ThoxOS con endpoint Ollama local (`http://localhost:11434`) y nodos MeshStack.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia de codigo en local: el modelo puede generar y completar codigo en un portatil o equipo de sobremesa mediante `ollama run Thox-ai/thoxforge-7b`, sin enviar codigo propietario a servicios en la nube, lo que encaja con el lema de privacidad del autor.
- Despliegue en nodos de borde (edge): el GGUF Q4_K_M de ~4,37 GB cabe en hosts con al menos 8 GB de RAM, lo que permite servir generacion de texto en maquinas modestas dentro de una red MeshStack.
- Prototipado rapido de pipelines de texto: gracias a la ruta Transformers + PEFT sobre el adaptador, un equipo puede cargar el LoRA sobre Mistral-7B-Instruct-v0.3 y experimentar con prompts de dominio especifico sin reentrenar.
- Generacion de documentacion tecnica y comentarios de codigo: el enfasis en codigo del ajuste lo hace util para tareas de resumen y explicacion de fragmentos de codigo en ingles.
- Entornos air-gapped o con requisitos de soberania de datos: al ejecutarse completamente en local con llama.cpp u Ollama, es adecuado para organizaciones que no pueden usar APIs externas.
- Base para nuevos ajustes: al ser un adaptador LoRA de rango 8 con licencia Apache-2.0, puede servir como punto de partida o como ejemplo de pipeline de publicacion de adaptadores y GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no existe ningun artefacto de evaluacion ni cifra de calidad publicada para ThoxForge-7B, y que no se ha publicado ningun resultado GATE49. El unico dato de evaluacion mencionado es negativo: una variante GGUF independiente fallo la evaluacion interna de datos corporativos (fabricacion de historial del fundador) y fue retirada sin publicar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el GGUF Q4_K_M ocupa 4.372.812.160 bytes (~4,37 GB), por lo que requiere al menos ~5-6 GB de memoria libre para cargar el modelo y el contexto; el autor indica dimensionado para hosts con al menos 8 GB de RAM.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor no publica requisitos de GPU especificos.
- Cabe en GPU de consumo: si, en principio cualquier GPU con al menos ~6 GB de VRAM puede alojar el Q4_K_M; el autor no confirma modelos concretos (RTX 4090, etc.) ni ha validado el modelo en hardware de dispositivos THOX.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxforge-7b`), llama.cpp (`llama-cli -m thoxforge-7b-Q4_K_M.gguf`), y Transformers + PEFT sobre el adaptador safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota: el autor indica que el modelo no esta cualificado en el hardware de dispositivos THOX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxForge-7B-GGUF | 7B (LoRA r8) | no disponible | Apache-2.0 | GGUF Q4_K_M + adaptador safetensors | Sin benchmarks publicados; distribucion via Ollama y HF |
| Mistral-7B-Instruct-v0.3 (base) | 7B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF de terceros | Modelo base del que deriva; sin ajuste de codigo especifico |
| Mistral-7B-Instruct-v0.2 | 7B | no disponible en esta ficha | Apache-2.0 | safetensors | Version anterior del mismo linaje |

La comparacion con alternativas de la misma categoria (otros ajustes de 7B orientados a codigo) no esta disponible en la informacion proporcionada, ya que no se aportan datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se publica ningun artefacto de evaluacion ni log de entrenamiento; el autor no reclama ninguna cifra de calidad.
- Los modelos cuantizados y los adaptadores cometen errores factuales y pueden producir respuestas seguras pero incorrectas; se recomienda verificar las respuestas importantes.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- La cuantizacion intercambia precision por tamano, con la consiguiente perdida de exactitud frente a los pesos completos.
- El modelo no es un asistente publico alineado en seguridad salvo que se despliegue detras de las barreras de proteccion (guardrails) de THOX.
- Uso fuera de alcance declarado por el autor: decisiones medicas, legales, financieras o de seguridad critica sin revision humana; control no supervisado de dispositivos fisicos sin paso de confirmacion.
- No esta cualificado en el hardware de dispositivos THOX.
- Este repositorio no contiene pesos; quien intente descargar desde aqui no obtendra archivos de modelo. Hay que acudir al repositorio principal.
- El autor documenta un fallo previo de una variante GGUF independiente en la evaluacion de datos corporativos, lo que sugiere riesgo de alucinacion en hechos especificos de la empresa.

## Enlaces

- Repositorio Hugging Face (este, solo model card): https://huggingface.co/Thox-ai/ThoxForge-7B-GGUF
- Repositorio principal con pesos (GGUF + adaptador LoRA): https://huggingface.co/Thox-ai/ThoxForge-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Ollama: `Thox-ai/thoxforge-7b` (tag en Ollama; sin URL directa en la informacion proporcionada)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
