# Thox-ai/ThoxOS-Kernel-27B

## Resumen

ThoxOS-Kernel-27B es un checkpoint publicado por Thox-ai (THOX.ai) concebido como modelo de "host-tier" para tareas de kernel Linux, administración de sistemas, runbooks de shell y systemd, y operaciones de su plataforma MeshStack. El modelo se presenta como un fine-tune de parámetros completos sobre la base `JonathanColetti/Qwen3.8-27B-Uncensored`, de la que hereda el tamaño de 27B parámetros y una orientación explícitamente "uncensored". Además de su función operativa, está designado como modelo profesor para versiones más pequeñas de la familia ThoxOS-Kernel.

El punto crítico de este checkpoint es que, según la propia model card, el fine-tune **no se ha ejecutado todavía**: no hay pesos adjuntos al repositorio, no se ha aplicado ningún dato de entrenamiento y no se reclama ningún resultado. El repositorio contiene únicamente el archivo `.gitattributes` (1.519 B). La publicación es, por tanto, un anuncio de disponibilidad futura bajo licencia Apache-2.0 y no un artefacto utilizable hoy.

La relevancia actual es limitada desde el punto de vista técnico —no hay modelo que evaluar— pero resulta informativa como declaración de intenciones: pesos abiertos sin registro, despliegue vía Ollama, un slot de modelo de kernel intercambiable en ThoxOS (spec S10) y una política editorial explícita sobre publicación de resultados solo cuando estén medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de `JonathanColetti/Qwen3.8-27B-Uncensored`; no detallada en la información proporcionada) |
| Parametros totales | 27B (según nombre del modelo y badges de la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona distribución vía Ollama, sin detallar cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (los pesos aún no están publicados; el repositorio solo contiene `.gitattributes`) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna del modelo base `JonathanColetti/Qwen3.8-27B-Uncensored` más allá del nombre, que sugiere una variante de la familia Qwen con 27B parámetros y un proceso de "uncensoring" (presumiblemente abliteration o un fine-tune que elimina rechazos). La model card de ThoxOS-Kernel-27B no detalla capas, tipo de atención, tokenizador ni configuración de contexto.

Respecto al entrenamiento, la card es explícita: el fine-tune de parámetros completos **no se ha ejecutado**. No se ha aplicado ningún dato, no se describe la composición del dataset (se mencionan dominios objetivo: kernel Linux, sysadmin, systemd, shell, build y diagnóstico de ThoxOS, MeshStack) y no se documenta ningún proceso de RLHF, DPO o similar. La sección de entrenamiento queda pendiente de completarse cuando producción se ejecute.

## Capacidades

- Generación de texto orientada a operaciones de sistema (pipeline declarado: `text-generation`).
- Propuesta de acciones de sistema para revisión humana; el modelo no ejecuta acciones directamente según la card.
- Trabajo sobre kernel Linux y administración de sistemas: operaciones, diagnóstico, runbooks de shell y systemd.
- Soporte declarado para build y diagnóstico de ThoxOS y operaciones de MeshStack en hosts THOX.
- Función de modelo profesor para los modelos más pequeños de la familia ThoxOS-Kernel.
- Capacidades multilingües: solo inglés declarado.
- Tool calling, function calling, agentes multi-paso, visión, audio o modo "thinking": no disponibles en la información proporcionada.
- Al ser un checkpoint sin pesos ni evaluación, ninguna de estas capacidades está verificada empíricamente.

## Casos de uso

- **Asistencia a operaciones de kernel Linux**: el modelo está diseñado para proponer comandos y cambios de configuración en hosts THOX que un operador revisa antes de aplicar; encaja en flujos de cambio controlado donde la ejecución automática no es aceptable.
- **Generación de runbooks de shell y systemd**: producción de procedimientos operativos reproducibles para servicios y unidades systemd, aprovechando el entrenamiento previsto sobre dominios de sysadmin.
- **Diagnóstico de builds de ThoxOS**: apoyo en la interpretación de fallos de compilación y diagnóstico del sistema operativo propio de THOX, según el alcance declarado en la card.
- **Operaciones de MeshStack en hosts THOX**: asistencia en tareas de la plataforma MeshStack, limitada al entorno de host de THOX.
- **Modelo profesor para destilación**: generación de datos o supervisión para los modelos ThoxOS-Kernel más pequeños, que es su rol explícito dentro de la familia.
- **Sustitución configurable en ThoxOS**: despliegue a través del slot de modelo de kernel (spec S10, Thox Kernel Lab), que permite intercambiar este modelo por otro modelo de kernel elegido por el usuario.
- **Distribución local vía Ollama**: la card prevé publicación en Ollama sin cuenta ni coste, lo que facilitaría su uso en máquinas host con control total de datos.

Ninguno de estos casos es ejecutable hoy: no existen pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no existe ninguna evaluación para este checkpoint y que los resultados se publicarán únicamente cuando se realice una ejecución medida.

## Requisitos de hardware

- VRAM estimada: no disponible. Para un modelo denso de 27B, las estimaciones habituales serían aproximadamente 54 GB en FP16, 27 GB en INT8 y 14-16 GB en cuantizaciones de 4 bits, pero estos cálculos son orientativos y no proceden de la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. La card clasifica el modelo como "host-tier only" y afirma que no cabe en el presupuesto residente de ningún dispositivo THOX, sin dar cifras.
- Opciones de despliegue: se menciona distribución vía Ollama; vLLM, llama.cpp o TGI no se citan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas comparables, y el checkpoint carece de pesos y evaluaciones que permitan una comparación fundamentada.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ThoxOS-Kernel-27B | 27B | no disponible | Apache-2.0 | Sin pesos ni evaluación |
| `JonathanColetti/Qwen3.8-27B-Uncensored` (base) | 27B | no disponible | no disponible | Modelo base declarado |
| Alternativas de 27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sin pesos publicados**: el repositorio solo contiene `.gitattributes`; el fine-tune no se ha ejecutado y no hay artefacto descargable.
- **Sin evaluación**: no existe ninguna métrica de capacidad o rendimiento medida; cualquier expectativa de calidad es especulativa.
- **Restricción de despliegue**: el modelo es "host-tier only" y no está empaquetado para dispositivos; no se ofrecen cifras de memoria para planificar el hardware.
- **Idioma**: solo inglés declarado; no hay soporte multilingüe documentado.
- **Naturaleza "uncensored" del base**: la base elimina rechazos de forma deliberada, lo que incrementa el riesgo de generar contenido dañino o instrucciones peligrosas en un dominio (administración de sistemas) donde los comandos erróneos pueden causar daños reales.
- **Riesgo de alucinación**: sin evaluación no puede acotarse; en tareas de kernel y sysadmin, una alucinación puede traducirse en comandos destructivos, por lo que la revisión humana es obligatoria según la propia card.
- **Usos excluidos**: uso médico y serving público alojado quedan fuera de alcance según el autor.
- **Licencia**: Apache-2.0 para el fine-tune y adiciones de THOX; deben verificarse por separado los términos del modelo base upstream.
- **Sesgos**: no documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
