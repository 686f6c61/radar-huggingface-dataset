# vaibhavrpi/Qwen3.5-4B-think-graft-GGUF

## Resumen

Qwen3.5-4B-think-graft es una variante modificada del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario vaibhavrpi en Hugging Face. No se trata de un reentrenamiento ni de un fine-tuning: es una edicion quirurgica de una sola fila de la capa de salida del modelo, distribuida como un archivo GGUF Q8_0 que funciona en llama.cpp estandar sin cambios en el motor de inferencia. El objetivo es que el propio estado oculto del modelo decida cuando terminar su bloque de razonamiento (`</think>`), reduciendo el gasto de tokens en tareas matematicas.

La tecnica, denominada "think-graft", anade un termino `β·g` al logit del token `</think>`, donde `g` es una sonda lineal (LDA con contraccion en forma cerrada) entrenada para activarse en los finales de parrafo en los que la respuesta correcta ya ha aparecido y el modelo solo esta re-verificando. El factor β es 14. El resultado es un modelo de 4.841.450.496 parametros (aproximadamente 4,84 mil millones) que conserva el resto de la distribucion de probabilidad intacta, token a token.

La relevancia de esta publicacion es metodologica: demuestra que es posible modificar el comportamiento de parada del razonamiento sin entrenamiento y con un unico tensor anadido. Los resultados publicados son preliminares y con conjuntos de evaluacion muy pequenos, por lo que debe tratarse como una prueba de concepto mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B), con cabeza de salida desacoplada anadida |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de uso; limite nativo del modelo base no disponible) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,84 mil millones de parametros con la capa de salida atada a la matriz de embeddings de entrada (weight tying). La modificacion introducida por think-graft rompe ese atado: anade un tensor `output.weight` separado que es la matriz de embeddings con una unica fila alterada, cuantizada en Q8_0, mientras que el embedding de entrada permanece intacto. llama.cpp detecta y carga automaticamente esta cabeza desacoplada.

No hay entrenamiento ni fine-tuning en el sentido habitual. La sonda `g` (2.560 floats, una por dimension del estado oculto) se ajusto con LDA con contraccion en forma cerrada sobre 22 trazas de razonamiento del propio modelo en MATH-500, niveles de dificultad 3 a 5. La intervencion consiste en sumar `14·(g·h)` al logit de `</think>`, de modo que el resto de tokens conserva exactamente su probabilidad relativa. El archivo `think-graft-probe.npy` con la sonda se distribuye junto al GGUF.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con parada del bloque de razonamiento modulada por el estado oculto.
- Razonamiento matematico: es el dominio sobre el que se ajusto y valido la sonda.
- Reduccion del consumo de tokens de razonamiento en tareas de re-verificacion (hasta un 54 % en el conjunto reportado).
- Compatibilidad con llama.cpp estandar, incluido `llama-server` con plantilla Jinja.
- Hereda las capacidades del modelo base Qwen3.5-4B (conversacional, generacion de texto); el detalle concreto de tool calling, agentes o multilingueismo no esta documentado en la model card de esta variante.

## Casos de uso

- Razonamiento matematico con presupuesto de tokens ajustado: el modelo termina antes sus bloques de re-verificacion, lo que permite resolver problemas dentro de ventanas de contexto limitadas donde el modelo original agotaba el presupuesto. Es el escenario directamente validado por el autor.
- Despliegue en GPU de consumo: al ocupar 5,2 GB en Q8_0, cabe en tarjetas de 8 GB con contexto de 32k, lo que permite ejecutar un modelo de razonamiento de forma local.
- Evaluacion de tecnicas de control de razonamiento: util como referencia reproducible para investigadores que estudien la parada adaptativa del thinking sin reentrenar.
- Prototipado de pipelines de inferencia con llama.cpp: sirve para probar integraciones con `llama-server` y plantillas Jinja en entornos de desarrollo.
- Experimentos academicos sobre sondas lineales: el par GGUF + `think-graft-probe.npy` permite reproducir y extender el analisis de la sonda sobre estados ocultos.
- Pruebas de reduccion de coste de inferencia: medir el ahorro de tokens en cargas de razonamiento antes de decidir si merece la pena adoptar la tecnica en un modelo mayor.

## Benchmarks y rendimiento

| Conjunto | Modelo original (thinking on) | Este modelo |
|---|---|---|
| MATH-500, 8 problemas reservados | 8/8, 34.955 tokens | 8/8, 16.080 tokens (-54 %; thinking -60 %) |
| AIME 2025 I-7, I-9, II-8 | 0/3 (agotaron el presupuesto de 32k re-verificando) | 2/3 |

Muestreo empleado: temperatura 0,6, top-p 0,95, top-k 20. La probabilidad de `</think>` en el modelo en vivo coincide con la prediccion offline en tres posiciones de re-verificacion (0,597 frente a 0,605; 0,944 frente a 0,942; 0,993 frente a 0,993). El autor advierte explicitamente que son resultados tempranos con conjuntos muy pequenos.

## Requisitos de hardware

- VRAM estimada: 5,2 GB para el archivo Q8_0; el autor indica que cabe en una GPU de 8 GB con contexto de 32k.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q8_0 a contexto completo; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: si, en tarjetas de 8 GB o mas.
- Opciones de despliegue: llama.cpp, en particular `llama-server` con `-ngl 99 -fa on -c 32768 --jinja`. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-think-graft (este) | 4,84 B | 32k configurado | Apache-2.0 | GGUF Q8_0 | Parada de thinking modulada, sin entrenamiento |
| Qwen/Qwen3.5-4B (base) | 4,84 B | no disponible | Apache-2.0 | safetensors y otras | Punto de partida; gasta mas tokens en re-verificar |
| Alternativas de ~4B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La sonda se ajusto sobre 22 trazas de MATH-500 del propio modelo (niveles 3-5) y solo se valido en matematicas; el comportamiento en otros dominios no esta probado en este modelo.
- Los conjuntos de evaluacion son muy pequenos (8 problemas de MATH-500 y 3 de AIME); el autor califica los resultados de tempranos.
- La edicion sacrifica parte de la re-verificacion: una parada temprana podria, en principio, omitir una comprobacion que habria detectado un error. No se encontro ningun caso asi en las trazas reservadas comprobadas, pero el riesgo conceptual existe.
- Solo se publica cuantizacion Q8_0; no hay variantes Q4_K_M, Q5 u otras.
- No se declaran idiomas soportados en la model card de esta variante.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial, pero sin garantias del autor sobre el comportamiento modificado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/vaibhavrpi/Qwen3.5-4B-think-graft-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Blog post (metodo, resultados, limitaciones): https://think-graft.vercel.app
- Codigo y logs: https://github.com/nextgen-user/think-graft
