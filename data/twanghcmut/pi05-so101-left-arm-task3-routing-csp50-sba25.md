# twanghcmut/pi05-so101-left-arm-task3-routing-csp50-sba25

## Resumen

El modelo `pi05-so101-left-arm-task3-routing-csp50-sba25` es un bundle de inferencia para robótica publicado por el usuario twanghcmut, derivado del checkpoint `twanghcmut/pi05-so101-left-arm-task3`. Se trata de una adaptación del modelo π0.5 (pi05) orientada al control del brazo robótico SO101 en una tarea concreta, empaquetada junto con un GGUF nativo denso, una capa de enrutamiento CSP (routing-csp) calibrada sobre las demostraciones de entrenamiento del modelo base y una atención temporal SBA (sin pesos ajustados). El repositorio incluye además el código fuente C++ necesario para compilar el runtime de inferencia.

La relevancia de este artefacto es acotada: no es un modelo de propósito general ni un checkpoint entrenado desde cero, sino un paquete de despliegue reproducible para un pipeline de visión-lenguaje-acción (VLA) sobre un brazo SO101 concreto. El autor advierte explícitamente de que no se reclama ninguna tasa de éxito robótica y de que los episodios fuente usados para el ajuste del enrutamiento son datos de entrenamiento, no una evaluación en held-out.

El tamaño del repositorio es de 12,8 GB, la licencia es Apache 2.0 y la fecha de creación es el 11 de noviembre de 2026. No se dispone de información sobre parámetros, longitud de contexto ni idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (VLA basado en π0.5, según tags y model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (denso nativo incluido en el bundle); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (denso nativo) + overlay de routing CSP + atención temporal SBA |
| Modelo base | twanghcmut/pi05-so101-left-arm-task3 (revisión 78d001395fa89646dfe97c60b18623f2f7f04b4b) |
| Pipeline | robotics |
| Tamaño del repositorio | 12,8 GB |
| Runtime | C++ propietario del bundle (`vla_cpp_source.tar.gz`), compilación con `VLA_SPM=ON` |
| Tarea | control del brazo SO101 (left arm), task3 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base más allá de su filiación a la familia π0.5 (pi05) y su uso como política visión-lenguaje-acción para robótica. El bundle añade dos componentes sobre el checkpoint base: un GGUF denso nativo y una capa de enrutamiento CSP (routing-csp) calibrada sobre las demostraciones de entrenamiento del modelo fuente. La atención temporal SBA se describe como un mecanismo que no requiere pesos ajustados, lo que sugiere una modificación de la atención en inferencia más que un reentrenamiento.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor indica que los episodios fuente usados para el ajuste del enrutamiento son datos de entrenamiento y no una evaluación en held-out, lo que implica que la calibración del overlay CSP se realizó sobre las mismas demostraciones con las que se entrenó el modelo base.

## Capacidades

- Control de un brazo robótico SO101 (left arm) para la tarea task3, mediante política VLA.
- Inferencia en modo denso por defecto o con enrutamiento CSP y atención temporal SBA activables por parámetros (`--routing_csp 50 --temporal_attention 25 --euler 1`).
- Modo CLI para una única observación grabada.
- Modo servidor persistente, necesario para las decisiones SBA y de routing que dependen de la llamada anterior.
- API de reset en cada frontera de episodio.
- No se documentan en la información disponible capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Despliegue de referencia para el brazo SO101 en la tarea task3: el bundle permite reproducir el pipeline de inferencia del checkpoint base con un runtime C++ compilado a medida, útil para validar el entorno antes de integrar el modelo en un sistema mayor.
- Evaluación comparativa de enrutamiento CSP: al poder activar o desactivar el overlay (`--routing_csp 50` frente al modo denso por defecto), permite medir el efecto del enrutamiento sobre las decisiones del modelo en una misma tarea.
- Evaluación de atención temporal SBA: el flag `--temporal_attention 25` permite comparar el comportamiento con y sin atención temporal, útil para estudiar la dependencia de la política respecto a la observación anterior.
- Investigación en políticas VLA sobre hardware de bajo coste: el SO101 es un brazo accesible, y este bundle proporciona un punto de partida reproducible para experimentos de manipulación con modelos π0.5.
- Integración en un bucle de control persistente: el modo servidor y la API de reset permiten montar un bucle de episodios con estado entre llamadas, adecuado para pruebas de laboratorio con el brazo real.
- Reproducibilidad de artefactos: los hashes en `bundle.json` y las instrucciones de compilación permiten reconstruir el entorno exacto de inferencia, útil para auditorías internas o para comparar variantes del bundle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito robótica ("No robot success rate is claimed") y que los episodios usados para el ajuste son datos de entrenamiento, no una evaluación en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,8 GB, pero no se especifica el reparto entre pesos GGUF, overlay y código fuente.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime C++ propio incluido en `vla_cpp_source.tar.gz`, compilado con `VLA_SPM=ON`; requiere `huggingface_hub` en el entorno Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA para brazos SO101) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- El autor no reclama ninguna tasa de éxito robótica; no hay evidencia publicada de funcionamiento en el robot real.
- El ajuste del enrutamiento CSP se realizó sobre las demostraciones de entrenamiento del modelo base, no sobre un conjunto held-out, por lo que existe riesgo de sobreajuste a esas trayectorias.
- El modo CLI solo admite una observación grabada; las decisiones SBA y de routing requieren el modo servidor persistente y llamar a la API de reset en cada frontera de episodio. Omitir el reset puede contaminar el estado entre episodios.
- El bundle depende de un runtime C++ propio que debe compilarse con `VLA_SPM=ON`; no se documenta compatibilidad con stacks de inferencia estándar.
- No se dispone de información sobre sesgos, alucinación, cobertura idiomática ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no detalladas en la información disponible; conviene verificar el checkpoint fuente antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp50-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Código fuente del runtime (tar.gz): https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp50-sba25/resolve/main/vla_cpp_source.tar.gz
