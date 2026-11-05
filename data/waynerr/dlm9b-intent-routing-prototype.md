# WayneRR/dlm9b-intent-routing-prototype

## Resumen

`WayneRR/dlm9b-intent-routing-prototype` no es un modelo de lenguaje. Es un repositorio de investigación que archiva el código, las configuraciones, los tests y los registros experimentales de un prototipo de enrutamiento de intenciones y planificación multi-backend. El autor lo etiqueta explícitamente como `no-weights`: no contiene ficheros `.gguf`, `.safetensors`, `.pt` ni ningún otro artefacto de pesos descargable. El tamaño del repositorio es de 0.0 GB.

El proyecto implementa una cadena de software compuesta por una entrada unificada, un protocolo de tareas (`TaskSpec`), un parser de intenciones, un gestor de memoria y condiciones, un planificador (*scheduler*) con enrutamiento *fail-closed* y prioridad por capacidades, tres adaptadores de backend independientes (TEXT, IMAGE, VIDEO), un validador y un registro de resultados. Los tres backends son modelos de terceros ya publicados (MiMo 9B, sd-turbo, AnimateDiff-Lightning, epiCRealism, Lance_3B); el proyecto no entrena ni ajusta ningún peso de enrutamiento propio.

Su relevancia es metodológica, no de rendimiento: documenta de forma explícita qué está verificado, qué está parcialmente verificado y qué no debe afirmarse, e incluye un conjunto de validación sellado con criterios preregistrados. Es útil para investigadores interesados en reproducibilidad de pipelines multimodales y en disciplina experimental, no para desarrolladores que busquen un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo. Prototipo de software (parser de intenciones + scheduler + adaptadores de backend) |
| Parámetros totales | No disponible (el repositorio no contiene pesos) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se distribuye ningún artefacto GGUF ni safetensors) |
| Idiomas soportados | Chino (`zh`) e inglés (`en`) en la documentación y el prototipo |
| Licencia | Apache-2.0, aplicable únicamente al código del proyecto; los pesos de terceros conservan sus licencias de origen |
| Formato de pesos | Ninguno: repositorio sin pesos (`no-weights`) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal que describir. El prototipo es una capa de orquestación: recibe una petición en una entrada unificada, la convierte en un `TaskSpec`, resuelve la intención, aplica el tratamiento de memoria y condiciones, y despacha la tarea al backend correspondiente mediante un planificador con aislamiento por subproceso y terminación por timeout. El enrutamiento es *fail-closed* y prioriza por capacidades declaradas del backend.

No existe entrenamiento, ajuste fino ni RLHF/DPO asociado al proyecto. La documentación declara de forma explícita que no hay ningún modelo de enrutamiento entrenado por el autor ni conversiones GGUF propias. Los backends utilizados son MiMo 9B (texto), sd-turbo y epiCRealism (imagen) y AnimateDiff-Lightning (vídeo), además de pruebas parciales con el modelo unificado Lance_3B. La innovación técnica destacable es de ingeniería: protocolo de tareas versionado, trazabilidad de sustituciones de backend, conjunto de validación sellado y criterios preregistrados con validación bootstrap.

## Capacidades

- Enrutamiento de intenciones hacia backends de texto, imagen y vídeo mediante un protocolo de tareas común.
- Planificación con política *fail-closed*: si el backend no declara la capacidad requerida, la tarea no se despacha.
- Aislamiento de ejecución por subproceso con terminación por timeout.
- Recuperación, inyección y bloqueo de conflictos de memoria, con registro de cero recuperaciones para memorias irrelevantes.
- Trazabilidad de sustituciones de backend y registro estructurado de metadatos de ejecución (unos 5200 ficheros JSON/CSV/MD).
- Suite de tests offline: 189 pasados, 1 omitido y 4 deseleccionados; demo con backend *stub* que ejecuta 19/19 comprobaciones sin red ni uso de VRAM.
- Soporte documental en chino e inglés.
- No incluye generación propia de texto, imagen o vídeo: esa capacidad reside en los backends de terceros.

## Casos de uso

- Reproducción de pipelines multimodales: el paquete permite reconstruir la cadena completa con dependencias offline fijadas (14 paquetes, sin torch) y verificar el comportamiento del scheduler con backends *stub*, útil como base para experimentos de orquestación.
- Estudio de metodología experimental: los criterios preregistrados, el conjunto de validación sellado y el registro de resultados sirven como plantilla para diseñar evaluaciones con separación explícita entre lo verificado y lo no verificado.
- Diseño de enrutadores de intención: el parser y el `TaskSpec` pueden tomarse como referencia para implementar una capa de despacho entre modelos especializados en lugar de un modelo único.
- Auditoría de trazabilidad: el registro de sustituciones de backend y los metadatos por ejecución permiten reconstruir qué modelo generó cada artefacto, requisito habitual en entornos con requisitos de procedencia.
- Gestión de memoria en agentes: los mecanismos de recuperación, inyección y bloqueo de conflictos documentados aportan un punto de partida para implementar memoria condicional, aunque su beneficio de calidad no está demostrado.
- Formación y revisión técnica: la sección de limitaciones y la tabla de "verificado / no verificado / no debe afirmarse" son material directo para discutir buenas prácticas de publicación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no evalúa calidad de generación con métricas estándar (MMLU, HumanEval, GSM8K); sus únicas métricas son de ingeniería (tests, comprobaciones de demo) y un criterio de similitud CLIP que saturó en 320 ejecuciones (todas superadas, Δ bootstrap = 0), por lo que el autor lo describe como techo del criterio de evaluación.

## Requisitos de hardware

- El repositorio en sí no requiere GPU: la demo offline funciona con backend *stub* sin red ni VRAM.
- Para ejecutar los backends reales se necesita hardware local o remoto según cada modelo de terceros; el autor reporta pruebas en una única GPU de consumo de 12 GB.
- La ruta de vídeo con el modelo unificado Lance_3B no se completó: el criterio Gate0 determinó recursos locales insuficientes frente a los ≥40 GB de VRAM indicados por el proyecto upstream.
- No se proporcionan cifras de latencia ni throughput.
- Opciones de despliegue: ejecución directa del paquete Python (entorno virtual con `env/locks/lock-offline.txt`, Python 3.11 y 3.13 probados); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoría porque el artefacto no es un modelo, sino un prototipo de orquestación sin pesos. Comparar con modelos de lenguaje, difusión o vídeo de 9B de parámetros no sería metodológicamente válido.

## Limitaciones y advertencias

- El repositorio no contiene ningún modelo ni pesos: no puede desplegarse como generador de texto, imagen o vídeo.
- Los resultados proceden de una única GPU de consumo de 12 GB, con muestras pequeñas (4–16 casos por 4–5 repeticiones) y una ventana de ejecución fija (2026-10-14 a 2026-10-20); no son generalizables.
- La ruta de vídeo del modelo unificado Lance_3B no está validada; el plan en la nube se archivó sin generar costes ni evidencia.
- El beneficio de calidad de la memoria no está demostrado ni refutado: el criterio CLIP saturó y constituye un techo de evaluación.
- La precisión del parser de intenciones sobre distribuciones de producción no está medida.
- La licencia Apache-2.0 cubre solo el código del proyecto; los pesos de terceros mantienen sus licencias, incluida la restricción de sd-turbo a investigación no comercial y las cláusulas tipo RAIL-M.
- El usuario asume la responsabilidad de verificar licencias de modelos, datos y contenido generado antes de cualquier uso comercial.
- No debe afirmarse que el proyecto implementa un modelo unificado, que entrena un modelo propio, que produce GGUF propios, que la memoria mejora la calidad o que los resultados son comercializables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WayneRR/dlm9b-intent-routing-prototype
- Código y documentación completa: https://github.com/kialajin-l/dlm9b-intent-routing-prototype
