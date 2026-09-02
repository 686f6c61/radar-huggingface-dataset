# zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e-mtp

## Resumen

El modelo `zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e-mtp` es una cuantización mixta de 5 bits en formato MLX del fine-tune `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, desarrollado originalmente por DavidAU con contribuciones de Nightmedia. Se trata de un modelo de 27 781 millones de parámetros basado en la arquitectura Qwen3.8, orientado a seguimiento de instrucciones, razonamiento, análisis, creatividad y generación de texto sin censura.

La cuantización fue realizada por el usuario zviratko mediante la herramienta oQ (oMLX v0.6.4), que aplica precisión mixta con 5 bits y tamaño de grupo 64. El resultado es un modelo en safetensors de MLX con un peso total de 20,3 GB, pensado para ejecutarse eficientemente en hardware Apple Silicon. Su relevancia radica en ofrecer una versión compacta y desplegable de un fine-tune que, según su autor, alcanza puntuaciones elevadas en tareas de razonamiento tipo ARC, a la vez que elimina restricciones de censura en la generación de texto.

Al tratarse de un modelo derivado y cuantizado, la información oficial sobre licencia, idiomas y contexto es limitada o no está publicada. No obstante, por su naturaleza "uncensored" y su formato MLX, resulta atractivo para desarrolladores que buscan ejecutar un modelo local de gran tamaño en Macs con memoria unificada, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (transformer, tipo `qwen3_5`) |
| Parametros totales | 27 781 427 952 (27,8 B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (el base Qwen3.8 soporta 128k, sin confirmar para este fine-tune) |
| Tipos de cuantizacion | 5 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27,8 mil millones de parámetros. Sobre él, DavidAU aplicó un proceso de fine-tune denominado "Cold Fusion", que combina los métodos GAIN y Unsloth, y que según la documentación del autor mantiene el 99 % del rendimiento del modelo en BF16 cuando se cuantiza a 8 o 4 bits. El nombre incluye las etiquetas "TURBO", "Fable", "Heretic" y "Uncensored", que sugieren ajustes adicionales orientados a mejorar la velocidad de generación, la creatividad narrativa y la eliminación de filtros de contenido.

La cuantización actual fue realizada con oQ (oMLX v0.6.4), una herramienta que aplica cuantización de precisión mixta. En este caso se usaron 5 bits con un tamaño de grupo de 64, lo que produce un modelo de aproximadamente 20,3 GB en formato safetensors de MLX. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto sin censura, orientada a instrucciones, razonamiento, análisis y creatividad.
- Seguimiento de instrucciones generales, con capacidad para responder a peticiones complejas y de múltiples pasos.
- Razonamiento y análisis de problemas, con especial énfasis en tareas tipo ARC (Abstraction and Reasoning Corpus) según las afirmaciones del autor del fine-tune original.
- Potencial para generación narrativa y roleplay debido a la etiqueta "Fable" y su naturaleza "uncensored".
- No se han confirmado capacidades adicionales como tool calling, visión o audio en la información disponible.

## Casos de uso

- Asistentes de escritura creativa sin restricciones temáticas: el modelo puede redactar ficción, poesía o guiones sin los filtros habituales de otros modelos, gracias a su naturaleza "uncensored". Su formato MLX permite ejecutarlo localmente en Macs con suficiente memoria.
- Prototipado de aplicaciones de chat locales: al ser una cuantización de 5 bits en MLX, se puede integrar en proyectos con Swift o Python para macOS, ofreciendo respuestas rápidas sin conexión a internet.
- Investigación en razonamiento abstracto: si las afirmaciones sobre ARC son correctas, el modelo puede utilizarse para experimentar con tareas de razonamiento visual y lógico, aunque no se ha validado de forma independiente.
- Generación de contenido para juegos de rol o narrativa interactiva: su capacidad para mantener personajes y tramas sin censura lo hace adecuado para motores de texto en juegos.
- Análisis de textos y resúmenes: con 27,8 B de parámetros, puede procesar documentos largos y extraer información relevante, siempre que la longitud de contexto lo permita (dato no confirmado).
- Evaluación de técnicas de cuantización: al ser un ejemplo de cuantización oQ de 5 bits, los desarrolladores pueden usarlo para comparar el impacto de la precisión mixta en modelos grandes frente a versiones en 8 o 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 5 bits en MLX. El autor del fine-tune original (DavidAU) afirma que el modelo sin cuantizar supera 735 en ARC-c y 880 en ARC-e en 8 bits, y 718 en ARC-c en 4 bits, pero estos datos provienen de la versión GGUF y no de esta variante MLX. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta versión concreta.

## Requisitos de hardware

- El modelo cuantizado a 5 bits ocupa 20,3 GB en disco. En memoria, se estima que necesita entre 21 y 25 GB de RAM unificada en Apple Silicon (por ejemplo, Mac Studio con M1 Ultra o M2 Max con 64 GB).
- En FP16, el modelo completo requeriría aproximadamente 55-61 GB de VRAM, según estimaciones de plataformas como Spheron. Con cuantización INT4, se reduce a unos 15 GB.
- Para GPUs de NVIDIA, una RTX 4090 (24 GB VRAM) podría ejecutar la versión de 5 bits con ciertas optimizaciones, aunque el formato MLX está diseñado principalmente para Apple Silicon.
- Opciones de despliegue: al ser MLX, se puede ejecutar con MLX-LM o MLX-Examples. Para otros entornos, sería necesario convertir los pesos a GGUF o usar versiones alternativas del mismo modelo.
- La latencia y el throughput dependen del hardware; en un Mac Studio con M2 Ultra se esperan velocidades de decodificación de varios tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.8-27B es el principal punto de referencia, y existen otras cuantizaciones del mismo fine-tune (por ejemplo, la versión GGUF de DavidAU). Se puede comparar con:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 128k (presumible) | BF16 | Apache 2.0 (según Qwen) |
| Este modelo (MLX 5-bit) | 27,8 B | no disponible | 5-bit oQ | no disponible |
| Versión GGUF de DavidAU | 27,8 B | no disponible | 8-bit / 4-bit | no disponible |

La comparativa directa no es posible sin datos de rendimiento publicados para esta cuantización específica.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", lo que implica que puede generar contenido ofensivo, ilegal o dañino. No debe usarse en aplicaciones sensibles sin supervisión humana.
- No se ha publicado la licencia, por lo que el uso comercial es incierto y requiere contactar con el autor o verificar los términos del modelo base.
- La cuantización de 5 bits puede introducir degradación en la calidad de generación respecto al modelo original en BF16, aunque el método Cold Fusion afirma mantener el 99 % del rendimiento en 8 y 4 bits (no confirmado para 5 bits).
- No hay información sobre sesgos, alucinaciones o comportamientos adversos específicos de este modelo.
- La longitud de contexto no está confirmada; si se hereda de Qwen3.8, sería de 128k, pero no se garantiza tras el fine-tune y la cuantización.
- El formato MLX limita su uso a entornos Apple Silicon; para otras plataformas se requiere conversión o usar otras versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Versión GGUF del modelo original (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Recomendador de GPU de Spheron: https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU/
