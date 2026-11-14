# Xylolabs/LTX-2.5-Block0-Tenstorrent-Tensix-BFP4

## Resumen

LTX-2.5-Block0-Tenstorrent-Tensix-BFP4 es un componente cuantizado derivado del modelo base Lightricks/LTX-2.5, publicado por Xylolabs. Se trata de un artefacto parcial (etiquetado como "component" y "block0") que contiene únicamente el primer bloque del transformer de LTX-2.5, convertido al formato de coma flotante por bloques BFP4 (block-floating-point, variante `bfloat4_b`) y empaquetado para su ejecución sobre hardware Tenstorrent mediante la pila de software TTNN/Tensix.

El modelo base LTX-2.5 es un generador de vídeo de Lightricks (la familia LTX-Video), pero esta publicación no es un modelo autónomo: es un bloque aislado preparado para validación o prototipado en aceleradores Tenstorrent. No incluye pesos completos, tokenizador ni pipeline de inferencia funcional, por lo que no puede emplearse directamente para generar vídeo.

Su relevancia es experimental: demuestra una ruta de cuantización a 4 bits por bloques para ejecutar modelos de vídeo de gran tamaño en hardware no-GPU (Tenstorrent Tensix), y acompaña a un preprint (arXiv:2601.03233) sobre representaciones block-floating-point. El acceso está restringido y requiere aceptar la licencia comunitaria de LTX-2.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque de transformer de difusion (componente del modelo base LTX-2.5); formato block-floating-point BFP4 (`bfloat4_b`) para TTNN/Tensix |
| Parametros totales | no disponible (solo se publica el bloque 0 del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (block-floating-point de 4 bits, variante `bfloat4_b`); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, requiere aceptacion) |
| Formato de pesos | pesos PyTorch/ttnn (repo de 0,8 GB); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de novo, sino una conversión de pesos: toma el bloque 0 del transformer de difusión de Lightricks/LTX-2.5 y lo reempaqueta en el formato block-floating-point BFP4 que consume la pila TTNN de Tenstorrent. En BFP4 los valores se agrupan en bloques que comparten un exponente, de modo que cada elemento se almacena en 4 bits de mantisa con escala compartida; esto reduce el ancho de banda de memoria a costa de precisión, algo crítico en aceleradores con memoria limitada como Tensix.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, porque el modelo base no se reentrena aquí. La innovación técnica declarada es la propia representación BFP4 sobre Tensix, descrita en el preprint arXiv:2601.03233, junto con la integración en TTNN. No hay datos sobre decodificación especulativa, atención lineal ni otras optimizaciones del bloque.

## Capacidades

- No es un modelo generativo autónomo: al contener solo el bloque 0, no puede generar texto, vídeo ni imágenes por sí mismo.
- El modelo base LTX-2.5 es un generador de vídeo de difusión; las capacidades finales dependen de ensamblar todos los bloques y el pipeline completo.
- Soporte de tool calling / function calling: no disponible (no aplica a un generador de vídeo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: ejecución de un bloque cuantizado a 4 bits en hardware Tenstorrent Tensix mediante TTNN, útil para validar kernels y precisión numérica.

## Casos de uso

- Validación de kernels TTNN: comprobar que la implementación de operaciones del bloque 0 (atención, MLP, normalizaciones) produce resultados numéricamente aceptables en BFP4 sobre Tensix antes de portar el modelo completo.
- Estudio de precisión de cuantización: medir la degradación de la salida del bloque 0 frente al bloque original en bfloat16 para estimar el impacto de BFP4 en la calidad final del vídeo generado.
- Prototipado en aceleradores Tenstorrent: disponer de un bloque real de un modelo de vídeo de Lightricks para desarrollar y depurar pipelines de inferencia en hardware no-GPU.
- Benchmarking de ancho de banda: comparar el rendimiento de BFP4 frente a otras precisiones en Tensix para dimensionar la memoria necesaria en el despliegue completo de LTX-2.5.
- Reproducción de resultados de investigación: replicar los experimentos del preprint arXiv:2601.03233 sobre representaciones block-floating-point en modelos de difusión de vídeo.
- Integración en cadenas de conversión: servir como referencia para construir herramientas que automaticen la conversión de bloques de LTX-2.5 a formatos TTNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent con núcleos Tensix y pila TTNN; no está pensado para GPU convencional.
- VRAM estimada: no disponible; el repo ocupa 0,8 GB, correspondiente únicamente al bloque 0 cuantizado.
- GPU recomendadas: no aplica; el formato BFP4/TTNN no es ejecutable directamente en CUDA sin conversión.
- ¿Cabe en GPU de consumo? No en su formato actual; requeriría de-cuantizar y reconstruir el bloque para PyTorch.
- Opciones de despliegue: TTNN sobre Tenstorrent; vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5-Block0-Tenstorrent-Tensix-BFP4 (este) | Bloque 0 del base | no disponible | BFP4 / TTNN | ltx-2.x-community | Restringida (gated) |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | safetensors (presumible) | ltx-2.x-community | Restringida (gated) |
| Otros bloques cuantizados de Xylolabs | no disponible | no disponible | BFP4 / TTNN | ltx-2.x-community | no disponible |
| Alternativas de generación de vídeo open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Artefacto parcial: contiene solo el bloque 0; no genera vídeo ni texto por sí mismo.
- Dependencia de hardware específico: requiere Tenstorrent Tensix y TTNN; no es portable a GPU sin conversión manual.
- Pérdida de precisión por BFP4: la cuantización a 4 bits por bloques puede degradar la calidad del bloque; no se documenta el error numérico.
- Acceso restringido: requiere aceptar la licencia ltx-2.x-community-license-agreement en Hugging Face, con posibles restricciones de uso comercial.
- Sesgos y alucinaciones: no evaluables en un componente; heredados del modelo base LTX-2.5 en caso de uso completo.
- Sin datos de idioma, contexto ni benchmarks: imposible validar su comportamiento en producción.
- Repo de 0,8 GB: no incluye tokenizador, configuración de pipeline ni scripts de inferencia documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/LTX-2.5-Block0-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Preprint citado: arXiv:2601.03233 (representaciones block-floating-point)
- Documentación Tenstorrent TTNN: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible
