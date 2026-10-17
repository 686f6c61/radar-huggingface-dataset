# tstepspam/Cydonia-24B-v4.3-heretic-v4-Q8-MLX

## Resumen

Cydonia-24B-v4.3-heretic-v4-Q8-MLX es una cuantizacion en 8 bits del modelo coder3101/Cydonia-24B-v4.3-heretic-v4, publicada por el usuario tstepspam en formato MLX para su ejecucion en hardware de Apple Silicon. Se trata de un modelo de generacion de texto de arquitectura transformer densa con 23.572.403.200 parametros (unos 23,6 mil millones), derivado de la familia Mistral segun los tags del repositorio, aunque la informacion disponible no confirma la version exacta del modelo base original.

La relevancia de esta ficha no esta en la cuantizacion en si, sino en la cadena de derivacion del modelo. Cydonia-24B-v4.3-heretic-v4 es una version "decensored" de TheDrummer/Cydonia-24B-v4.3, generada con Heretic v1.2.0 mediante una tecnica de ablacion ortogonal con preservacion de magnitud (Magnitude-Preserving Orthogonal Ablation, MPOA). El resultado es un modelo "abliterated": se han eliminado o atenuado los mecanismos de rechazo aprendidos durante el alineamiento, de modo que el modelo intenta responder a peticiones que un modelo comercial alojado declinaria.

El repositorio concreto que se analiza aqui es una cuantizacion de 8 bits en formato MLX, con un tamano de 25,1 GB y cero descargas y cero likes en el momento de la consulta, creado el 16 de octubre de 2026. No se especifica licencia ni idiomas soportados, lo que limita cualquier evaluacion de uso comercial o multilingue sin consultar las fichas de los modelos antecesores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Mistral (segun el tag "mistral"; version exacta no confirmada en la informacion disponible) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (Q8) en formato MLX en este repositorio; el modelo base dispone de cuantizaciones GGUF publicadas por terceros |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 23,6 mil millones de parametros, coherente con la familia Mistral Small de 24B, tal como sugiere el tag "mistral" del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original TheDrummer/Cydonia-24B-v4.3, por lo que esos datos deben consultarse en las fichas de los modelos antecesores.

La innovacion tecnica relevante es el proceso de abliteration aplicado por el autor coder3101 sobre el modelo base. Segun la ficha del modelo antecesor, se utilizo Heretic v1.2.0 con parametros de ablacion ortogonal con preservacion de magnitud (MPOA). Esta tecnica identifica las direcciones del espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera, preservando la magnitud de las representaciones para minimizar el dano colateral en las capacidades generales. El resultado es un modelo que mantiene la estructura y el conocimiento del original pero sin la capa de alineamiento de seguridad. La cuantizacion a 8 bits en MLX la realiza el publicador del repositorio analizado, y no se documentan cambios adicionales en pesos mas alla de la propia cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno en el estilo del modelo base Cydonia-24B-v4.3.
- Respuesta a peticiones de seguridad ofensiva y contenido que los modelos comerciales alojados suelen rechazar, segun las fichas de modelos abliterated consultadas.
- Generacion de codigo y contenido tecnico, heredada del modelo base de 24B, aunque no hay benchmarks publicados que lo cuantifiquen en esta variante.
- Escritura creativa sin los filtros de rechazo del modelo original.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es unicamente text-generation.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Generacion de corpus para red teaming: el modelo puede producir respuestas a prompts de seguridad ofensiva que un modelo alojado declina, lo que permite construir conjuntos de datos para evaluar clasificadores de contenido y sistemas de moderacion.
- Investigacion sobre alineamiento y rechazo: sirve como referencia de "modelo no alineado" de la clase 24B para medir que produce un modelo sin capas de rechazo y compararlo con su version original.
- Evaluacion comparativa de tecnicas de abliteration: al existir varias versiones del mismo linaje (v1 y v4), permite medir el efecto de distintos parametros de ablacion sobre las capacidades conservadas.
- Escritura creativa y ficcion sin restricciones tematicas: util para autores que necesitan generar material narrativo en generos o registros que los modelos alineados suavizan o rechazan.
- Generacion de datos sinteticos para fine-tuning: el modelo puede etiquetar o ampliar datasets en dominios donde el filtrado de seguridad del modelo original introduciria un sesgo de seleccion.
- Inferencia local en equipos Apple Silicon: al estar cuantizado en Q8 para MLX, permite ejecutar un modelo de 23,6B en un Mac con memoria unificada suficiente, sin depender de GPUs dedicadas ni de servicios en la nube.
- Pruebas de robustez de pipelines de moderacion: integrar el modelo como generador adversarial dentro de un sistema de moderacion permite validar la cobertura de las reglas antes de desplegarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos en Q8 ocupan aproximadamente 25,1 GB (tamano del repositorio), por lo que se recomienda un minimo de 32 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- GPU compatibles: el formato MLX esta disenado para Apple Silicon, por lo que el destino natural son chips de la serie M de Apple (M1, M2, M3, M4) en configuraciones Max o Ultra.
- GPUs NVIDIA (A100, H100, RTX 4090): no son compatibles directamente con MLX; seria necesario convertir los pesos a otro formato (por ejemplo GGUF o safetensors de PyTorch), algo no documentado en este repositorio.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabria en equipos con 32 GB o mas de memoria unificada; en el ecosistema NVIDIA habria que recurrir a las cuantizaciones GGUF del modelo base (se menciona una version GGUF de 13,4 GB en un repositorio de terceros).
- Opciones de despliegue: MLX y mlx-lm para Apple Silicon. vLLM y TGI no soportan MLX de forma nativa; llama.cpp y Ollama requeririan una conversion a GGUF que este repositorio no ofrece.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Cydonia-24B-v4.3-heretic-v4-Q8-MLX (este) | 23,6 B | no disponible | 8-bit MLX | no disponible | HuggingFace, 0 descargas |
| coder3101/Cydonia-24B-v4.3-heretic-v4 | no disponible | no disponible | pesos completos | no disponible | HuggingFace (modelo base directo) |
| coder3101/Cydonia-24B-v4.3-heretic | no disponible | no disponible | pesos completos | no disponible | HuggingFace (version previa de la abliteration) |
| TheDrummer/Cydonia-24B-v4.3 | no disponible | no disponible | pesos completos | no disponible | HuggingFace (modelo original, con alineamiento) |

No se dispone de datos de benchmarks ni de contexto para establecer una comparacion cuantitativa de rendimiento entre estas variantes; la unica diferencia documentada es la aplicacion de la abliteration con Heretic v1.2.0 y MPOA en las versiones "heretic".

## Limitaciones y advertencias

- Licencia no disponible: sin un termino de licencia explicito no puede asumirse permiso para uso comercial; debe verificarse en las fichas de TheDrummer/Cydonia-24B-v4.3 y de coder3101/Cydonia-24B-v4.3-heretic-v4.
- Modelo abliterated: la ablacion elimina parte de los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o inseguro sin las salvaguardas habituales. No es apto para despliegues orientados al publico sin una capa externa de moderacion.
- Riesgo de degradacion por abliteration: la ablacion ortogonal puede afectar a capacidades generales, coherencia o calidad de razonamiento respecto al modelo original, aunque no hay benchmarks publicados que cuantifiquen ese efecto en esta variante.
- Alucinacion: al igual que cualquier modelo de lenguaje de esta clase, puede inventar hechos, referencias y codigo; no se han publicado evaluaciones de fidelidad para esta version.
- Contexto e idiomas no documentados: se desconoce la ventana de contexto efectiva y el soporte multilingue real de esta cuantizacion.
- Dependencia de MLX: el formato limita el despliegue a hardware Apple Silicon o a conversiones manuales no documentadas.
- Riesgo de reproducibilidad: al ser una cuantizacion de un modelo abliterated, los resultados pueden diferir de los del modelo base en funcion del backend y de la precision numerica.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad ni garantia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-heretic-v4-Q8-MLX
- Modelo base directo: https://huggingface.co/coder3101/Cydonia-24B-v4.3-heretic-v4
- Version previa de la abliteration: https://huggingface.co/coder3101/Cydonia-24B-v4.3-heretic
- Modelo original (TheDrummer): https://huggingface.co/TheDrummer/Cydonia-24B-v4.3
- Ficha en abliteratedmodels.org (v4): https://www.abliteratedmodels.org/cydonia-24b-v4.3-heretic-v4/
- Ficha en abliteratedmodels.org (v1): https://www.abliteratedmodels.org/cydonia-24b-v4.3-heretic/
- Cuantizacion GGUF de terceros: https://local-ai-zone.github.io/models/cydonia-24b-v4-3-heretic-v4.html
