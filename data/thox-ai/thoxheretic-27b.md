# Thox-ai/ThoxHeretic-27B

## Resumen

ThoxHeretic-27B es una redistribución comunitaria de un modelo multimodal en formato GGUF, publicada por Thox-ai (THOX.ai LLC) a partir de Qwen/Qwen3.6-27B. El repositorio contiene únicamente dos artefactos: una cuantización Q4_K_M de 18,05 GB y un proyector de visión `mmproj-f16.gguf` de 927 MB, lo que permite entrada de imagen junto con texto. El propio autor declara de forma explícita que no ha entrenado estos pesos, que no ha publicado ninguna evaluación y que no emite ninguna afirmación de calidad sobre ellos.

La relevancia del modelo no está en su rendimiento, sino en su naturaleza: se trata de una build "abliterated" (sin censura), es decir, con el comportamiento de rechazo reducido respecto al modelo base, redistribuida de forma pública y sin control de acceso (ungated). Esto lo hace útil como objeto de estudio para investigación sobre alineamiento, robustez de filtros de seguridad y evaluación de mecanismos de rechazo en modelos multimodales, y a la vez lo convierte en un artefacto problemático para cualquier despliegue en producción orientado a usuarios finales.

El modelo base declarado es Qwen3.6-27B, con 26.895.998.464 parámetros reales según los metadatos de pesos, licencia Apache-2.0 declarada y soporte únicamente de inglés según la model card. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.6-27B; detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en F16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (declarada; los pesos son redistribución de terceros) |
| Formato de pesos | GGUF (`thoxheretic-27b-q4_k_m.gguf`, `mmproj-f16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo declarado en los metadatos: se trata de un modelo multimodal de tipo image-text-to-text construido sobre Qwen/Qwen3.6-27B, con un proyector de visión separado en formato F16 que se carga junto al modelo principal mediante `--mmproj` en llama.cpp. El tamaño de contexto, el número de capas, la configuración de atención y el tipo de tokenizador no están documentados en la información proporcionada.

Respecto al entrenamiento, THOX declara explícitamente que no ha entrenado estos pesos: el repositorio es una redistribución de una build comunitaria "abliterated" de terceros. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. La única intervención atribuida a THOX es el empaquetado y la publicación del repositorio. La técnica de abliteración aplicada al modelo base no está descrita en la model card, por lo que se desconoce qué direcciones de activación se modificaron ni con qué metodología.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de entrada de imagen junto con texto (pipeline image-text-to-text), mediante el proyector `mmproj-f16.gguf`.
- Comportamiento de rechazo reducido ("minimal-refusal"): el modelo está diseñado para responder a peticiones que un modelo alineado convencional rechazaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue local-first.
- Razonamiento y código: capacidades heredadas del modelo base Qwen3.6-27B, aunque no verificadas ni evaluadas por el redistribuidor.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre alineamiento y rechazo: el modelo sirve como caso de estudio controlado para medir cómo la abliteración altera las tasas de rechazo y la utilidad general, comparando respuestas frente al modelo base Qwen3.6-27B con el mismo conjunto de prompts.
- Evaluación de filtros de seguridad y guardrails: permite probar capas de seguridad externas (clasificadores de entrada/salida, moderación) contra un modelo que no incorpora rechazo propio, validando que la protección reside en la infraestructura y no en los pesos.
- Análisis de robustez de sistemas multimodales: con el proyector de visión se pueden estudiar ataques de prompt injection a través de imágenes y comprobar si los filtros de salida detectan contenido no deseado en respuestas generadas a partir de entradas visuales.
- Experimentación académica en entornos aislados: al ser de descarga libre y sin control de acceso, resulta práctico para laboratorios que necesitan reproducir configuraciones de cuantización Q4_K_M en hardware de workstation sin solicitar permisos.
- Pruebas de cuantización y del pipeline GGUF: útil para medir el impacto de Q4_K_M frente a precisión completa en tareas de visión-lenguaje, y para validar el flujo `llama-cli --mmproj` en distintas versiones de llama.cpp.
- Desarrollo de herramientas de auditoría de modelos: integrable en pipelines que generan informes automáticos sobre comportamiento de modelos redistribuidos, incluyendo comparación de hashes SHA-256 y verificación de procedencia de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe ningún resultado GATE49 publicado para este modelo y que el redistribuidor no emite ninguna afirmación de calidad. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el modelo está dimensionado para hosts de clase workstation con al menos 32 GB de RAM o 24 GB de VRAM, en la cuantización Q4_K_M incluida (18,05 GB de pesos más 927 MB del proyector).
- GPU recomendadas: no disponibles de forma explícita; por tamaño de pesos, encajan GPU con 24 GB o más (por ejemplo, RTX 4090, RTX 3090, A100 40 GB, H100). No se confirma compatibilidad con GPU de 16 GB o menos en la información proporcionada.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB con la cuantización Q4_K_M, según el umbral de 24 GB VRAM indicado por el autor. En tarjetas de 12-16 GB requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--mmproj` para entrada de imagen), descarga vía `hf download`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. No se documenta soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| ThoxHeretic-27B | ~27B | no disponible | Sí (image-text-to-text) | Apache-2.0 declarada | Pública, sin control de acceso | Redistribución abliterated, sin evaluación publicada |
| Qwen/Qwen3.6-27B (base) | ~27B | no disponible | no disponible | no disponible en la información | Público en Hugging Face | Modelo base declarado; presumiblemente alineado |
| Otras builds abliterated de la misma familia | ~27B | no disponible | variable | variable | variable | No se dispone de datos verificados para comparar |

No se dispone de información suficiente sobre alternativas comparables (parámetros, contexto, rendimiento y licencia verificados) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no está entrenado por THOX ni sometido a tuning de seguridad; el propio autor advierte que no debe desplegarse a usuarios finales sin una capa de seguridad propia.
- Comportamiento de rechazo reducido por diseño (abliterated): aumenta la probabilidad de generar contenido que un modelo alineado rechazaría, con implicaciones legales y de política de uso en muchas jurisdicciones.
- Riesgo de alucinación no cuantificado: no hay evaluación publicada, por lo que no existe ninguna medida de fiabilidad factual.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea degradado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia: Apache-2.0 declarada, pero los pesos son una redistribución de terceros; el autor recomienda verificar la licencia intermedia antes de redistribuir. El uso comercial queda sujeto a las condiciones del modelo base y a la legislación aplicable.
- Procedencia: el modelo base registrado en los metadatos no está verificado de forma independiente por THOX; los hashes SHA-256 publicados permiten comprobar la integridad de los ficheros, no su origen.
- Fuera de alcance declarado: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana, y control no supervisado de dispositivos físicos sin confirmación.
- Ausencia total de benchmarks y de cualquier afirmación de calidad: cualquier decisión de uso debe basarse en evaluación propia.

## Enlaces

- [Thox-ai/ThoxHeretic-27B en Hugging Face](https://huggingface.co/Thox-ai/ThoxHeretic-27B)
- [Modelo base declarado: Qwen/Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Repositorio de llama.cpp (ejecución GGUF con `--mmproj`)](https://github.com/ggml-org/llama.cpp)
- [Herramienta `hf` de Hugging Face Hub para descarga](https://huggingface.co/docs/huggingface_hub/guides/cli)
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
