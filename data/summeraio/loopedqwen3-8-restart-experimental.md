# summerAIO/LoopedQwen3.8-Restart-Experimental

## Resumen

LoopedQwen3.8-Restart-Experimental es un repositorio experimental publicado por el usuario summerAIO en HuggingFace. No se trata de un modelo listo para usar, sino de un registro de experimentos orientados a investigar compartición selectiva de pesos, destilación y reducción del espacio de almacenamiento sobre un derivado del modelo `summerAIO/Qwen3.8-27B-Longbook27-v2`. El autor indica explícitamente que no se ha publicado ningún checkpoint comprimido usable y que el objetivo de obtener un checkpoint de 4 GB que preserve la calidad de un modelo de 27B no se ha alcanzado.

El repositorio parte de un derivado "all-GDN" (atención lineal tipo Gated Delta Net en todas las capas) y no del checkpoint oficial híbrido `Qwen/Qwen3.8-27B`. El flujo de trabajo descrito consiste en descargar la fuente fijada por revisión, verificar la carga del modelo profesor, ejecutar una generación de línea base y revisar antes de aplicar cualquier compresión destructiva. El autor advierte que fusiones espaciales agresivas previas fallaron en las pruebas de generación y no se presentan como modelos exitosos.

Por tanto, esta ficha documenta un artefacto de investigación con licencia Apache 2.0, sin métricas publicadas, sin idiomas declarados y sin pipeline asignado. Es relevante únicamente como referencia para quienes siguen técnicas de compresión de pesos y destilación en modelos de gran tamaño, no como modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado "all-GDN" (atención lineal Gated Delta Net en todas las capas) sobre `summerAIO/Qwen3.8-27B-Longbook27-v2`; no es el checkpoint híbrido oficial `Qwen/Qwen3.8-27B` |
| Parametros totales | 27B (modelo base de referencia; el repo experimental no publica pesos comprimidos usables) |
| Parametros activos | no disponible (no se indica configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,7 GB) |

## Arquitectura y entrenamiento

El modelo base sobre el que se experimenta es un derivado "all-GDN" del checkpoint `summerAIO/Qwen3.8-27B-Longbook27-v2`, fijado en la revisión `46319430c16af66860b20f14986ad1032e991796`. La diferencia clave respecto al `Qwen/Qwen3.8-27B` oficial es que este derivado emplea atención lineal Gated Delta Net en todas las capas, en lugar de una arquitectura de atención híbrida. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El trabajo experimental del repositorio se centra en compartición selectiva de pesos, destilación y reducción de huella de almacenamiento, con el objetivo declarado de preservar la calidad del modelo de 27B en un checkpoint de 4 GB. El autor confirma que ese objetivo no se ha logrado y que fusiones espaciales previas fallaron en las pruebas de generación. El flujo actual descarga la fuente fijada, verifica la carga del profesor, ejecuta una generación de línea base y exige revisión humana antes de cualquier compresión destructiva; el script de línea base no lanza automáticamente entrenamiento ni genera nuevos pesos comprimidos. El estado se registra en `restart/status.json` y se respalda tras cada etapa o ejemplo.

## Capacidades

- No se documentan capacidades funcionales del checkpoint experimental; el autor indica que no hay un modelo comprimido usable publicado.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas ni visión en el artefacto del repositorio.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas soportados.
- No se documentan modos especiales (thinking mode, visión, audio).
- El modelo base de referencia es de 27B parámetros, pero sus capacidades no se trasladan automáticamente al artefacto experimental.

## Casos de uso

- Investigación en compresión de pesos: el repositorio sirve como registro reproducible de intentos de compartición selectiva de pesos y destilación sobre un modelo de 27B, con estado documentado en `restart/status.json`.
- Reproducción de líneas base: un investigador puede seguir el flujo descrito (descarga de la revisión fijada, verificación de carga del profesor, generación de línea base) para validar resultados antes de aplicar transformaciones destructivas.
- Estudio de arquitecturas de atención lineal: el derivado all-GDN permite comparar el comportamiento de Gated Delta Net en todas las capas frente a la atención híbrida del checkpoint oficial.
- Auditoría de fallos en fusiones espaciales: el autor documenta que fusiones agresivas fallaron en pruebas de generación, lo que resulta útil como referencia negativa en experimentos de merge.
- Docencia y formación: el repositorio ilustra buenas prácticas de trazabilidad (revisión fijada, respaldo de estado, revisión humana antes de compresión) en proyectos de investigación con modelos grandes.
- Planificación de infraestructura de investigación: el tamaño del repo (3,7 GB) y la referencia a un modelo de 27B permiten estimar requisitos de almacenamiento y cómputo para replicar el flujo.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ninguna aplicación final, al no existir checkpoint usable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto experimental (no hay pesos usables publicados). Para el modelo base de 27B, la VRAM dependería de la cuantización, pero no se documentan valores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplicables; el autor indica que el repositorio no está preparado para `from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 3,7 GB en formato safetensors, insuficiente para contener un modelo de 27B en precisión completa, lo que confirma que no hay checkpoint completo publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| LoopedQwen3.8-Restart-Experimental | 27B (base de referencia) | no disponible | all-GDN sobre Qwen3.8-27B-Longbook27-v2 | Apache 2.0 | Experimental, sin checkpoint usable |
| `summerAIO/Qwen3.8-27B-Longbook27-v2` | 27B | no disponible | Derivado all-GDN | no disponible | Modelo fuente del experimento |
| `Qwen/Qwen3.8-27B` | 27B | no disponible | Atención híbrida oficial | no disponible | Checkpoint oficial |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un checkpoint comprimido usable; no debe invocarse con `from_pretrained`.
- El objetivo de un checkpoint de 4 GB con calidad de 27B no se ha alcanzado según el propio autor.
- Fusiones espaciales previas fallaron en pruebas de generación y no se presentan como modelos exitosos.
- No se documentan sesgos conocidos, pero al ser un derivado no oficial de Qwen, los sesgos del modelo base podrían persistir; no verificable con la información disponible.
- Riesgo de alucinación: no evaluable, al no existir pesos desplegables.
- No se declaran idiomas soportados; el soporte multilingüe es desconocido.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero al no haber modelo funcional, la aplicabilidad comercial es nula en la práctica.
- El flujo de trabajo no inicia entrenamiento ni compresión automáticamente; requiere intervención manual y revisión, lo que limita su uso en pipelines automatizados.
- El estado se respalda tras cada etapa, pero no se documenta integridad ni verificación de checksums más allá de la revisión fijada.

## Enlaces

- HuggingFace: https://huggingface.co/summerAIO/LoopedQwen3.8-Restart-Experimental
- Modelo fuente citado: https://huggingface.co/summerAIO/Qwen3.8-27B-Longbook27-v2 (revisión `46319430c16af66860b20f14986ad1032e991796`)
- Checkpoint oficial de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Estado del experimento: `restart/status.json` (dentro del repositorio)
