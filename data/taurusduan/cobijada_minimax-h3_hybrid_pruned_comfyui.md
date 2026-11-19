# taurusduan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI

## Resumen

Cobijada MiniMax-H3 Hybrid (Pruned, Uncensored) es un checkpoint fusionado del modelo de difusion MiniMax H3, un diffusion transformer (DiT) conjunto de audio y video desarrollado originalmente por MiniMax y adaptado para su uso en ComfyUI. La fusion la firma el usuario Winnougan (publicada bajo el identificador taurusduan) y su objetivo es combinar en un unico checkpoint las dos modalidades de condicionamiento que MiniMax H3 distribuye por separado: FL (first/last-keyframe) y REF (reference-driven).

El problema que resuelve es concreto: el checkpoint FL ofrece mayor calidad visual y de audio pero no admite generacion guiada por referencias, mientras que el checkpoint REF anade esa capacidad a costa de degradar la calidad incluso en tareas sin referencia. El autor realizo una comparacion tensor a tensor de ambos checkpoints y determino que la mayoria de los pesos (proyecciones de atencion, MLPs, normas, proyecciones de parches, embeddings rotatorios y el refiner de tokens) son practicamente identicos, y que las diferencias relevantes se concentran en las proyecciones `adaln_proj` de cada bloque.

La solucion es una fusion por seleccion de pesos sin entrenamiento: se parte del checkpoint FL como base y se sustituyen unicamente los pesos `adaln_proj` de los bloques 25-49 (la mitad posterior de la red) por los del checkpoint REF. El resultado es un unico checkpoint que conserva la via de condicionamiento por referencia de REF manteniendo la fidelidad de FL en el resto de la red. Se distribuye en tres formatos (BF16, INT8 y W4A8) y en variantes pruned (podadas) y sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) conjunto de audio y video, derivado de MiniMax H3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 (ConvRot), W4A8 (ConvRot) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los pesos originales de MiniMax H3 quedan sujetos a la licencia de MiniMax) |
| Formato de pesos | safetensors (BF16, INT8, W4A8) |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) que genera video y audio de forma conjunta. La arquitectura y el layout de tensores son identicos a los de los checkpoints originales de MiniMax H3, por lo que el checkpoint hibrido se carga con el loader estandar de MiniMax H3 en ComfyUI sin necesidad de nodos personalizados. La red incluye proyecciones de atencion, MLPs, normas, proyecciones de parches, embeddings rotatorios, un token refiner y proyecciones AdaLN (`adaln_proj`) por bloque que inyectan la senal de condicionamiento en el flujo residual.

No se realizo entrenamiento, fine-tuning ni optimizacion basada en gradientes. La fusion es una seleccion de pesos a nivel de tensor: se toma el checkpoint FL como base completa y se reemplazan solo los pesos `adaln_proj` de los bloques 25-49 por los del checkpoint REF. Ambos checkpoints de origen eran ya variantes pruned y sin censura antes de la fusion. Las variantes INT8 y W4A8 se cuantizaron a partir del hibrido BF16.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video).
- Generacion conjunta de audio y video en una sola pasada del DiT.
- Condicionamiento por primer y ultimo fotograma (first/last-keyframe, modalidad FL).
- Generacion guiada por referencias de imagen, video y audio (modalidad REF), gracias a los pesos `adaln_proj` de los bloques 25-49 heredados de REF.
- Compatibilidad con flujos de trabajo de ComfyUI para carga de checkpoints MiniMax H3 sin nodos personalizados.
- Variantes cuantizadas INT8 y W4A8 para reducir requisitos de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito, al tratarse de un modelo generativo de video y audio y no de un modelo de lenguaje.

## Casos de uso

- Generacion de video con condicionamiento por referencia: el checkpoint permite usar imagenes, videos o audio de referencia para guiar la generacion, algo que el checkpoint FL no admite, manteniendo una calidad mas cercana a FL que a REF.
- Sustitucion directa del checkpoint REF en flujos existentes: al conservar arquitectura y layout de tensores, se puede reemplazar REF por este hibrido en pipelines ya montados en ComfyUI para obtener mejor calidad sin cambiar el grafo.
- Animacion de primer y ultimo fotograma: los flujos clasicos de FL siguen funcionando con este unico checkpoint, util para interpolar movimiento entre dos imagenes clave con audio sincronizado.
- Produccion de video con audio generado: al ser un DiT conjunto de audio y video, sirve para crear clips con banda sonora coherente sin un pipeline de audio separado.
- Prototipado en estaciones con GPU de gama alta: la variante BF16 permite evaluar calidad maxima, mientras que INT8 y W4A8 reducen el consumo de memoria para iteraciones mas rapidas.
- Despliegue en entornos con memoria limitada: las variantes cuantizadas W4A8 e INT8 facilitan ejecutar el modelo en GPUs con menos VRAM que las necesarias para el checkpoint BF16 completo.
- Experimentacion con merges de pesos: sirve como referencia practica de fusion por seleccion de tensores en modelos de difusion, util para investigadores que estudien tecnicas de model merging sin entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 73,7 GB e incluye tres variantes (BF16, INT8 y W4A8); el peso en VRAM depende de la variante cargada.
- VRAM estimada para inferencia: no disponible de forma explicita; la variante BF16 requiere la mayor cantidad de memoria y las variantes INT8 y W4A8 estan pensadas para reducirla.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio y el caracter de modelo de difusion de video sugieren requisitos elevados, pero no se aportan datos concretos.
- Opciones de despliegue: ComfyUI, colocando el checkpoint en `ComfyUI/models/diffusion_models/` y cargandolo con el loader estandar de MiniMax H3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Condicionamiento por referencia | Formatos | Licencia |
|---|---|---|---|---|
| Cobijada MiniMax-H3 Hybrid (este modelo) | DiT audio+video fusionado | Si (via adaln_proj de bloques 25-49 de REF) | BF16, INT8, W4A8 | Apache 2.0 (pesos base sujetos a licencia de MiniMax) |
| MiniMax H3 FL | DiT audio+video | No | no disponible | Licencia de MiniMax |
| MiniMax H3 REF | DiT audio+video | Si | no disponible | Licencia de MiniMax |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los checkpoints originales FL y REF en la informacion proporcionada, por lo que la comparacion se limita a las capacidades de condicionamiento y a los formatos distribuidos.

## Limitaciones y advertencias

- El propio autor indica que el modelo no supera la calidad del checkpoint FL en generacion sin condicionamiento por referencia, ya que la mayoria de sus pesos son compartidos con FL.
- La fusion se limita a los pesos `adaln_proj` de los bloques 25-49; no hay garantia de que la via de condicionamiento por referencia de REF se reproduzca con la misma fidelidad que en el checkpoint REF original.
- Es una variante sin censura (uncensored), lo que implica ausencia de filtros de seguridad y riesgo de generar contenido inapropiado; requiere supervision en produccion.
- Riesgo de sesgos y alucinacion visual o sonora inherente a los modelos de difusion; no se documentan evaluaciones al respecto.
- La licencia Apache 2.0 cubre la fusion y las conversiones cuantizadas, pero los pesos subyacentes de MiniMax H3 siguen sujetos a la licencia original de MiniMax, que debe revisarse antes de un uso comercial.
- No se documentan idiomas soportados ni limitaciones de contexto.
- El modelo tiene un unico like y fue publicado el 2026-11-02, por lo que su validacion por la comunidad es limitada pese a las 6742 descargas.
- No se aportan datos de benchmarks, latencia ni requisitos de VRAM concretos, lo que dificulta planificar su despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/taurusduan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI
- Perfil del autor de la fusion: https://huggingface.co/Winnougan
- Imagen de portada del modelo: https://huggingface.co/Winnougan/Cobijada_Minimax-H3_Hybrid_Pruned_ComfyUI/resolve/main/H3_Hybrid.png
