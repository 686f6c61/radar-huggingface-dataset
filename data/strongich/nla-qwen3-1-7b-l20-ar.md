# Strongich/nla-qwen3-1.7b-L20-ar

## Resumen

nla-qwen3-1.7b-L20-ar es el «Activation Reconstructor» (AR) de un autoencoder en lenguaje natural (Natural Language Autoencoder, NLA) construido sobre Qwen/Qwen3-1.7B. No es un modelo conversacional al uso: su tarea es predecir el vector del residual stream a la salida de la capa 20 del modelo base a partir de una descripción verbal generada por un verbalizer emparejado, es decir, reconstruir una activación interna desde su explicación en texto. Lo desarrolla el usuario Strongich dentro de un proyecto de interpretabilidad mecanicista, siguiendo la receta original del repositorio kitft/natural_language_autoencoders.

El checkpoint publicado corresponde a una época completa de entrenamiento conjunto con RL (el par AR + verbalizer se optimiza de forma acoplada), y está pensado para usarse junto a Strongich/nla-qwen3-1.7b-L20-av, el verbalizer que traduce activaciones a lenguaje natural. El repositorio ocupa 2,8 GB y contiene 1.368.220.928 parámetros reales en safetensors, heredando la arquitectura transformer decoder-only de Qwen3-1.7B.

Su relevancia es metodológica: ofrece una alternativa a los sparse autoencoders para auditar y monitorizar el estado interno de un LLM, con la ventaja de que el espacio latente es legible por humanos. El autor no publica métricas de fidelidad de reconstrucción ni licencia, lo que limita por ahora su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-1.7B, adaptado como Activation Reconstructor (NLA) |
| Parametros totales | 1.368.220.928 (1,37 B) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Qwen3-1.7B declara 32 768 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (hereda el tokenizador multilingüe de Qwen3, pero la tarea es de reconstrucción de activaciones, no de generación libre) |
| Licencia | No disponible (el modelo base Qwen3-1.7B es Apache 2.0, pero el autor no declara licencia para este checkpoint) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone transformer decoder-only de Qwen3-1.7B y lo reorienta a una tarea de regresión vectorial: dado el texto producido por el verbalizer, el AR debe reconstruir el vector del residual stream correspondiente a la salida de la capa 20 del modelo base. Se trata, por tanto, de la mitad «decoder» de un autoencoder cuyo cuello de botella es lenguaje natural en lugar de un espacio latente disperso. El checkpoint publicado es el resultado de una época completa de entrenamiento conjunto con RL de ambos componentes (AR y verbalizer), no de un ajuste supervisado aislado.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT o DPO. La innovación técnica principal es el propio esquema NLA: sustituir las features de un SAE por descripciones textuales y entrenar el par con señal de reconstrucción, lo que permite inspeccionar activaciones en lenguaje natural. El proyecto remite a la receta original de kitft/natural_language_autoencoders y al repositorio del autor para los detalles de implementación.

## Capacidades

- Reconstrucción de activaciones: predice el vector del residual stream de la capa 20 de Qwen3-1.7B a partir de una descripción textual.
- Interpretabilidad mecanicista: permite analizar qué información codifica una activación interna concreta en términos legibles.
- Funcionamiento en par con el verbalizer nla-qwen3-1.7b-L20-av, que genera la descripción de entrada.
- Entrenamiento con RL conjunto, que acopla la semántica del verbalizer a la fidelidad del reconstructor.
- Compatibilidad con el ecosistema transformers y con text-generation-inference (etiqueta endpoints_compatible), lo que facilita su despliegue como endpoint.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un componente de investigación, no un asistente.

## Casos de uso

- Auditoría de representaciones internas: dado un prompt problemático, se extrae la activación de la capa 20, el verbalizer la describe y el AR verifica que la descripción reconstruye fielmente el vector original, midiendo así la calidad de la explicación.
- Detección de features activas en producción: monitorizar la capa 20 de Qwen3-1.7B en un servicio desplegado y traducir picos de activación a descripciones legibles para alertar de comportamientos anómalos.
- Investigación en seguridad de modelos: localizar y caracterizar representaciones asociadas a contenido sensible o a instrucciones maliciosas sin depender de clasificadores externos.
- Depuración de fallos de razonamiento: comparar las activaciones de la capa 20 entre una respuesta correcta y una incorrecta para aislar en qué punto diverge el procesamiento interno.
- Evaluación comparativa de métodos de interpretabilidad: usar el par AR/verbalizer como línea base frente a sparse autoencoders en experimentos de fidelidad de reconstrucción y legibilidad humana.
- Docencia y divulgación: demostrar de forma tangible cómo un LLM representa información en su flujo residual, con explicaciones en lenguaje natural en lugar de índices de features.
- Construcción de pipelines de explicabilidad: integrar el par en una herramienta que genere informes automáticos sobre el estado interno del modelo base ante un conjunto de estímulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye métricas de fidelidad de reconstrucción (por ejemplo, similitud coseno entre el vector original y el reconstruido), ni comparaciones con SAEs u otros métodos, ni evaluaciones de legibilidad del verbalizer.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y del modelo base Qwen3-1.7B si se ejecuta el pipeline completo (en torno a 6-8 GB en total).
- VRAM estimada en cuantización int8: alrededor de 1,4 GB para los pesos del AR; en int4, en torno a 0,7-0,9 GB (cuantizaciones no publicadas por el autor, requerirían conversión manual).
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para experimentación cómoda con el pipeline completo; cualquier GPU consumer con 8 GB o más debería bastar para el AR aislado.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y vLLM según las etiquetas del repositorio; no hay artefactos GGUF publicados para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,37 B con una pasada corta, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nla-qwen3-1.7b-L20-ar | 1,37 B | No disponible (base: 32 768) | Reconstructor de activaciones de la capa 20 | No disponible | HuggingFace, 0 descargas |
| nla-qwen3-1.7b-L20-av (verbalizer emparejado) | No confirmado, presumiblemente mismo tamano | No disponible | Traduce activaciones a lenguaje natural | No disponible | HuggingFace |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | 32 768 tokens | Generacion de texto, razonamiento, codigo, multilingue | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Sparse autoencoders sobre modelos abiertos (p. ej. familia Gemma Scope) | Depende del diccionario | No aplica | Descomposicion de activaciones en features dispersas | Segun publicacion | Repositorios de interpretabilidad |

La comparación relevante no es de rendimiento en tareas de NLP, sino de metodología: frente a un SAE, el NLA ofrece un cuello de botella legible por humanos a cambio de una fidelidad de reconstrucción no documentada. Frente al modelo base, el AR no genera texto útil de forma autónoma, por lo que no compiten en el mismo eje.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial; en producción habría que verificar la situación legal con el autor antes de desplegarlo.
- Dependencia del verbalizer: el AR solo funciona correctamente en tándem con Strongich/nla-qwen3-1.7b-L20-av; usar otro verbalizer invalida la reconstrucción.
- Cobertura limitada a una única capa: solo modela el residual stream a la salida de la capa 20 de Qwen3-1.7B, no el resto de la red ni otros modelos.
- Entrenamiento corto: el checkpoint corresponde a una sola época de RL conjunto, sin datos publicados sobre convergencia, sobreajuste o estabilidad.
- Ausencia de métricas: sin evaluaciones de fidelidad de reconstrucción no es posible saber cuánta información se pierde en el cuello de botella de lenguaje natural.
- Riesgo de descripciones plausibles pero incorrectas: el verbalizer puede producir explicaciones verosímiles que no correspondan a la activación real; el AR es precisamente el mecanismo que debería detectarlo, pero su fiabilidad no está cuantificada.
- Pipeline declarado como text-generation: pese a la etiqueta, el modelo no es un generador de texto conversacional; usarlo como tal produciría salidas sin sentido.
- Idiomas y sesgos: no hay documentación sobre el comportamiento multilingüe ni sobre sesgos heredados de Qwen3-1.7B en el espacio de activaciones.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Strongich/nla-qwen3-1.7b-L20-ar
- Verbalizer emparejado: https://huggingface.co/Strongich/nla-qwen3-1.7b-L20-av
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor (código y paper): https://github.com/Strongich/doomloop-interp
- Receta original de Natural Language Autoencoders: https://github.com/kitft/natural_language_autoencoders
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
