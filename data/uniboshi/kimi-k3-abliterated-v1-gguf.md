# Uniboshi/Kimi-K3-Abliterated-V1-GGUF

## Resumen

Kimi-K3-Abliterated-V1-GGUF es una versión cuantizada en formato GGUF del modelo Kimi K3, desarrollado por Moonshot AI y posteriormente modificado por el usuario Uniboshi para eliminar los mecanismos de rechazo y censura (proceso conocido como *abliteration*). El modelo original, Kimi K3, es el primer modelo open-weight de clase 3T (2,8 billones de parámetros) con capacidades multimodales nativas (visión) y una ventana de contexto de 1 millón de tokens. Está construido sobre una arquitectura propia denominada Kimi Delta Attention (KDA) con Attention Residuals (AttnRes), diseñada para tareas de razonamiento de largo horizonte, codificación extensa y trabajo agéntico.

Esta versión abliterated se distribuye exclusivamente en formato GGUF, lo que permite su ejecución en hardware de consumo mediante llama.cpp, Ollama o LM Studio, aunque el tamaño del modelo (2,8T parámetros) implica que incluso cuantizado requiere una cantidad considerable de VRAM o el uso de CPU con memoria RAM abundante. El repositorio tiene un acceso restringido (gated) y una licencia propia (kimi-k3) que limita su uso comercial. La relevancia actual de este modelo radica en que combina una escala de parámetros sin precedentes en código abierto con visión nativa y razonamiento siempre activo, lo que lo posiciona como una alternativa a modelos propietarios de frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kimi Delta Attention (KDA) con Attention Residuals (AttnRes), transformer multimodal |
| Parametros totales | 2.779.483.135.584 (~2,8 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GGUF (varias, ver repositorio; tamaños desde ~200 GB hasta >1 TB) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia propia, restringida) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura transformer multimodal con dos innovaciones clave: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). KDA es una variante de atención que reduce el coste computacional en secuencias largas, permitiendo la ventana de 1M de tokens sin degradación de rendimiento. AttnRes añade conexiones residuales en el mecanismo de atención para mejorar la estabilidad del entrenamiento y la calidad de la representación. El modelo es nativamente multimodal, integrando visión desde el inicio (no un adaptador añadido posteriormente), y está diseñado para razonamiento agéntico con un modo de pensamiento siempre activo.

Los detalles exactos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se han publicado en la información disponible. El modelo original fue desarrollado por Moonshot AI y liberado con pesos abiertos, pero la versión abliterated ha sido modificada por Uniboshi para eliminar los mecanismos de rechazo de contenido, lo que implica que el proceso de alineación original ha sido parcialmente revertido.

## Capacidades

- Generación de texto y razonamiento de largo horizonte con ventana de contexto de 1M tokens.
- Visión nativa: puede procesar y razonar sobre imágenes de forma integrada.
- Razonamiento agéntico: diseño orientado a tareas multi-paso y toma de decisiones autónoma.
- Codificación extensa: capaz de manejar proyectos de software grandes con múltiples archivos.
- Trabajo de conocimiento: análisis y síntesis de documentos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente, pero implícito en su diseño agéntico.
- Multilingüismo: no se han publicado los idiomas soportados, aunque se espera cobertura amplia dado su origen.
- Capacidad de "thinking mode" (razonamiento siempre activo): indicado en la documentación de LM Studio.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede generar, revisar y refactorizar código en repositorios extensos gracias a su contexto de 1M tokens, permitiendo mantener coherencia en proyectos con decenas de miles de líneas.
- Análisis de documentos legales o científicos: procesa contratos, patentes o papers completos de más de 100.000 tokens en una sola pasada, extrayendo cláusulas o resultados relevantes.
- Agentes autónomos de investigación: con su razonamiento agéntico, puede planificar y ejecutar búsquedas web, leer múltiples fuentes y sintetizar informes sin intervención humana.
- Asistencia en soporte técnico de nivel 3: maneja conversaciones multi-turno con historial completo de la incidencia, accediendo a documentación interna y generando soluciones paso a paso.
- Generación de contenido creativo sin restricciones: la versión abliterated permite explorar temas sensibles o controvertidos que el modelo original rechazaría, útil para investigación académica en narrativa o ficción.
- Análisis de imágenes médicas o técnicas: su visión nativa permite interpretar radiografías, diagramas o capturas de pantalla y generar descripciones detalladas o diagnósticos preliminares (con supervisión humana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas comparativas y la documentación de Moonshot AI no detalla puntuaciones específicas en MMLU, HumanEval u otros tests estándar. Se recomienda consultar el repositorio oficial de Kimi K3 en GitHub para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: dado el tamaño de 2,8T parámetros, incluso en cuantización Q4_K_M se necesitan aproximadamente 1,5-2 TB de VRAM en GPUs de alta gama (8x A100 80GB o 4x H200). En CPU, se requieren al menos 1,5 TB de RAM para cargar el modelo en FP16.
- GPU recomendadas: NVIDIA H100, A100 80GB, o clusters multi-GPU. No es viable en GPUs de consumo (RTX 4090, 3090) a menos que se use una cuantización extremadamente agresiva (Q2) que degradaría severamente la calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si soporta GGUF), TGI. La ejecución en CPU con llama.cpp es posible pero con latencias muy altas (varios segundos por token).
- Latencia y throughput estimados: no disponibles en la información proporcionada. En hardware de gama alta, se espera un throughput de 5-20 tokens/s en cuantización Q4, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con modelos de la misma categoría. Los modelos open-weight más grandes hasta la fecha (Llama 3.1 405B, DeepSeek-V3 671B, Qwen2.5-Max) son significativamente menores en parámetros. Kimi K3 es el primer modelo abierto de clase 3T, por lo que no existe una comparativa directa en cuanto a escala. En términos de contexto, compite con modelos como Gemini 1.5 Pro (1M tokens) pero estos son propietarios. La licencia kimi-k3 es restrictiva para uso comercial, a diferencia de Llama 3.1 (licencia comunitaria) o DeepSeek (MIT).

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros. No es adecuado para despliegues públicos sin moderación adicional.
- La licencia kimi-k3 es restrictiva: aunque los pesos son abiertos, el uso comercial puede estar limitado. Consultar los términos exactos en el repositorio oficial.
- El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace.
- Los requisitos de hardware son extremadamente altos: la mayoría de organizaciones no pueden ejecutar este modelo en local, lo que limita su uso práctico a empresas con infraestructura de GPU masiva.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- La ventana de 1M tokens, aunque impresionante, puede degradar la calidad de atención en secuencias muy largas si no se usa correctamente.
- La versión abliterated puede tener una mayor tasa de alucinaciones al no estar sometida a los mismos controles de calidad que el modelo original.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Uniboshi/Kimi-K3-Abliterated-V1-GGUF
- Repositorio HuggingFace (modelo base abliterated): https://huggingface.co/Uniboshi/Kimi-K3-Abliterated-V1
- Repositorio GitHub oficial de Kimi K3: https://github.com/MoonshotAI/Kimi-K3/tree/main
- Documentación en LM Studio: https://lmstudio.ai/models/kimi-k3
