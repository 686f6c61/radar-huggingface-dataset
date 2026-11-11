# TheShellMaster/cypher-Wan2.1-T2V-1.3B

## Resumen

cypher-Wan2.1-T2V-1.3B es un espejo público del fichero `Wan2.1-T2V-1.3B-Q5_K_M.gguf`, una cuantización GGUF de 1,09 GB del modelo de generación de vídeo a partir de texto Wan 2.1 en su variante de 1,3 mil millones de parámetros, desarrollado originalmente por Wan-AI (Alibaba). El repositorio, publicado por el usuario TheShellMaster, no introduce ninguna modificación sobre la fuente: los pesos son idénticos bit a bit al fichero cuantizado de `samuelchristlie/Wan2.1-T2V-1.3B-GGUF`, con hash SHA-256 `aa1d654fa6904a16dd3e1915a4a34b92f0f37c00cf2fcbd1788add151bff8768`.

El modelo resuelve la tarea de text-to-video (T2V): a partir de una descripción textual genera una secuencia de vídeo. La relevancia de esta publicación concreta es de distribución, no técnica: ofrece una copia redundante del GGUF Q5_K_M con licencia Apache 2.0, etiquetada como abliterated y uncensored, y orientada a su ejecución mediante llama.cpp y Ollama en hardware modesto (la model card menciona una GPU T4 como objetivo de uso).

La arquitectura declarada es `wan`, con 1,3 B de parámetros y cuantización Q5_K_M (~5,4 bits por peso). No se especifica longitud de contexto nativa en la información disponible. Los idiomas declarados son francés e inglés. Al tratarse de un espejo sin reentrenamiento, todas las capacidades y limitaciones del modelo raíz Wan-AI/Wan2.1-T2V-1.3B se conservan íntegras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `wan` (modelo de difusión para vídeo, según modelo base Wan 2.1) |
| Parametros totales | 1,3 B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (la model card indica "— tokens"; los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q5_K_M (~5,3–5,7 bits/peso, media ~5,4); referencias: Q4_K_M ≈ 4,8, Q6_K ≈ 6,6, Q8_0 ≈ 8,5 bits/peso |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `Wan2.1-T2V-1.3B-Q5_K_M.gguf`, 1.087.410.400 bytes / 1,09 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `wan` y del pipeline `text-to-video`. El modelo raíz es Wan-AI/Wan2.1-T2V-1.3B, un modelo de generación de vídeo de 1,3 B de parámetros; no se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

El repositorio no realiza ningún entrenamiento ni ajuste: es un espejo bit a bit del GGUF Q5_K_M publicado por samuelchristlie. La model card menciona una etapa de "abliteration" en fp16 atribuida al propio repositorio Wan-AI, si bien la tabla de genealogía repite la misma URL para el modelo raíz y para la abliteración, lo que impide verificar la fuente exacta de esa etapa. La cuantización Q5_K_M es un K-quant mixto por bloques de 256 pesos, con mayor precisión en las capas de atención que en las capas FFN, escalas incluidas.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`).
- Ejecución en formato GGUF mediante llama.cpp y Ollama, según los ejemplos de la model card.
- Soporte declarado de francés e inglés.
- Etiquetado como abliterated y uncensored, lo que implica la supresión de mecanismos de rechazo del modelo original.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- No se documenta soporte multilingüe más allá de fr y en.

## Casos de uso

- Generación de clips de vídeo cortos a partir de descripciones textuales en inglés o francés: el modelo recibe un prompt de texto y produce una secuencia de vídeo, adecuado para prototipado rápido de ideas visuales.
- Pruebas de concepto en hardware de gama baja: con 1,09 GB de pesos en Q5_K_M, cabe en GPUs modestas como la T4 mencionada en la model card, lo que permite experimentar con T2V sin infraestructura dedicada.
- Integración en pipelines locales con llama.cpp: el fichero GGUF se carga con `llama-cli` y `-ngl 99`, útil para entornos sin acceso a frameworks de difusión específicos.
- Despliegue con Ollama: mediante un `Modelfile` con `num_ctx 8192` y `temperature 0.7` se puede empaquetar el modelo como servicio local para experimentación.
- Investigación sobre modelos abliterated/uncensored: al conservar las etiquetas del autor, sirve para estudiar el comportamiento de variantes sin filtros de rechazo en generación de vídeo.
- Distribución redundante y verificación de integridad: el hash SHA-256 publicado permite comprobar que la copia coincide con la fuente, útil en entornos con requisitos de trazabilidad de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos Q5_K_M ocupan 1,09 GB en disco, por lo que el requisito de memoria es bajo en comparación con modelos de vídeo de mayor tamaño.
- GPU recomendadas: la model card indica como uso visado "texte → vidéo — T4", es decir, NVIDIA T4.
- GPU de consumo: no se especifica compatibilidad con GPU consumer; dado el tamaño del fichero (1,09 GB), es plausible que quepa en GPUs consumer con suficiente VRAM, pero no hay confirmación en la información disponible.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -ngl 99`) y Ollama (mediante `Modelfile`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cypher-Wan2.1-T2V-1.3B (este) | 1,3 B | no disponible | GGUF Q5_K_M | apache-2.0 | espejo en HF |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 B | no disponible | pesos originales (fp16 según genealogía) | apache-2.0 | repositorio raíz en HF |
| samuelchristlie/Wan2.1-T2V-1.3B-GGUF | 1,3 B | no disponible | GGUF (incluye Q5_K_M) | apache-2.0 | repositorio fuente de la cuantización |

No se dispone de datos de benchmarks ni de otros modelos T2V comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo sin modificar: no aporta mejoras, correcciones ni cambios de plantilla respecto a la fuente; en caso de divergencia, la fuente prevalece.
- La etiqueta abliterated/uncensored implica ausencia de mecanismos de rechazo, con el consiguiente riesgo de generar contenido inapropiado; no se documenta ninguna evaluación de seguridad.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad de generación ni de posibles degradaciones por la cuantización Q5_K_M.
- La model card no documenta sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas más allá de los idiomas declarados (fr, en).
- La longitud de contexto nativa figura como no disponible; los valores `-c 8192` y `num_ctx 8192` de los ejemplos son parámetros de ejecución, no una especificación del modelo.
- La tabla de genealogía atribuye la abliteración a la misma URL que el modelo raíz, lo que genera ambigüedad sobre la procedencia exacta de esa etapa.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una copia conviene verificar las condiciones del modelo raíz y de la cuantización original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TheShellMaster/cypher-Wan2.1-T2V-1.3B
- Modelo raíz: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Cuantización GGUF de origen: https://huggingface.co/samuelchristlie/Wan2.1-T2V-1.3B-GGUF
