# tomtia/Intern-Decision-4B-GGUF

## Resumen

Intern-Decision-4B-GGUF es una cuantización Q4_K_M del modelo multimodal Intern-Decision-4B, publicada por el usuario tomtia para su aplicación Tomtia, un organizador de archivos local-first. El modelo base, desarrollado por Shanghai AI Laboratory (InternLM), deriva de Qwen/Qwen3.5-4B (Alibaba Cloud) mediante un ajuste fino orientado a toma de decisiones, y conserva la licencia Apache-2.0 de ambos linajes. El repositorio incluye tanto el cuerpo del modelo cuantizado como el proyector de visión (`mmproj-f16.gguf`) sin modificar, y ambos archivos deben usarse conjuntamente.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización reproducible y verificable (hashes SHA-256 publicados, comando exacto y reconstrucción byte-idéntica); por otro, ejemplifica el patrón de distribución de modelos multimodales pequeños (4,2 mil millones de parámetros) empaquetados para inferencia local con llama.cpp. El modelo no está pensado para generación abierta de texto, sino para seleccionar entre opciones fijas en un contexto de decisión estructurada.

Con 4.205.751.296 parámetros y un tamaño de repo de 3,4 GB, el modelo cabe en equipos de consumo y se ejecuta a través de `llama-server` con soporte de entrada image-text-to-text. No se dispone de información sobre idiomas soportados ni de benchmarks publicados en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen/Qwen3.5-4B; multimodal image-text-to-text) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (cuerpo del modelo); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con LICENSE de Intern-Decision y LICENSE-QWEN de Qwen) |
| Formato de pesos | GGUF (`intern-decision-4b-Q4_K_M.gguf` + `mmproj-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base Intern-Decision-4B es un ajuste fino de Qwen/Qwen3.5-4B realizado por Shanghai AI Laboratory, orientado a toma de decisiones y predicción estructurada. La model card no detalla la arquitectura interna (transformer denso, número de capas, cabezas de atención ni dimensión oculta), por lo que estos datos no están disponibles. Se sabe que es multimodal (pipeline image-text-to-text) y que incorpora un proyector de visión separado, empaquetado como `mmproj-f16.gguf`.

El proceso de cuantización está documentado con precisión: se partió de `intern-decision-4b-fp16-fixed.gguf` (conversión GGUF con metadatos corregidos, publicada por bombdefuser-124 en la revisión `0b1dc0b4a5b7eed290f662644237f5ee3694f260`) y se aplicó `llama-quantize` de llama.cpp versión 0.6.0-dev, build 300, commit `b42b7e6`, con el comando `llama-quantize intern-decision-4b-fp16-fixed.gguf intern-decision-4b-Q4_K_M.gguf Q4_K_M 4`. No se utilizó importance matrix. La reconstrucción del 3 de noviembre de 2026 produjo un archivo byte-idéntico (mismo SHA-256), lo que confirma la reproducibilidad del proceso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Toma de decisiones entre opciones fijas: el modelo está ajustado para seleccionar una alternativa dentro de un conjunto predefinido, no para generación libre.
- Predicción estructurada: orientado a producir salidas con formato controlado.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto gracias al proyector de visión incluido.
- Ejecución local: empaquetado para llama.cpp, lo que permite inferencia en el equipo del usuario sin conexión.
- Verificación de integridad: la aplicación Tomtia comprueba los hashes SHA-256 de ambos archivos antes de usarlos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, modo thinking, audio ni cobertura multilingüe explícita.

## Casos de uso

- Organización local de archivos: es el caso de uso original. El modelo recibe metadatos y contenido (incluidas imágenes) y elige entre categorías o acciones fijas para clasificar y mover archivos en el equipo del usuario, sin enviar datos a la nube.
- Clasificación de imágenes en escritorio: gracias al proyector de visión, puede etiquetar capturas, fotos o documentos escaneados seleccionando entre categorías predefinidas.
- Asistentes de escritorio con decisiones acotadas: integrado en una app de escritorio, permite resolver elecciones discretas (sí/no, categoría A/B/C) con latencia baja y sin dependencia de API externa.
- Enrutamiento de contenido en pipelines locales: puede decidir a qué proceso o carpeta derivar un archivo según su tipo y contenido visual, como paso previo a un pipeline de procesamiento mayor.
- Prototipado de sistemas de decisión estructurada: sirve como base para experimentar con modelos pequeños que emiten etiquetas controladas en lugar de texto libre.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, encaja en escenarios donde no se permite enviar datos a servicios externos.
- Validación de recetas de cuantización: el repositorio documenta comando, versión de herramienta y hashes, lo que lo convierte en referencia para reproducir cuantizaciones Q4_K_M verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el cuerpo cuantizado ocupa 2.708.804.512 bytes (unos 2,7 GB) y el proyector F16 672.423.424 bytes (unos 0,67 GB); en total, aproximadamente 3,4 GB de pesos, más el overhead de contexto y de la caché KV de llama.cpp.
- Cabe en GPU de consumo: con ~3,4 GB de pesos, es viable en tarjetas con 6-8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090); también puede ejecutarse en CPU.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU con al menos 6 GB de VRAM libre es suficiente para el modelo y el proyector.
- Opciones de despliegue: llama.cpp mediante `llama-server --model intern-decision-4b-Q4_K_M.gguf --mmproj mmproj-f16.gguf`. No se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Intern-Decision-4B-GGUF (este) | 4.205.751.296 | no disponible | Q4_K_M + mmproj F16 | Apache-2.0 | GGUF |
| internlm/Intern-Decision-4B (base) | no disponible | no disponible | FP16 | Apache-2.0 | safetensors/GGUF (no especificado) |
| Qwen/Qwen3.5-4B (origen) | no disponible | no disponible | no disponible | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita al linaje y a las condiciones de licencia.

## Limitaciones y advertencias

- El modelo está ajustado para elegir entre opciones fijas; no debe esperarse de él generación abierta de texto de calidad.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-4B puede heredar los sesgos de sus datos de entrenamiento, no especificados.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluaciones publicadas en la información disponible.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingüe concreto.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Requisito de usar ambos archivos juntos: el cuerpo y el proyector deben cargarse simultáneamente; la app verifica los hashes SHA-256 antes de su uso.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al redistribuir los archivos deben conservarse `LICENSE`, `LICENSE-QWEN` y `NOTICE` con las atribuciones y el aviso de modificación.
- El repositorio fija versiones por commit porque las apps instaladas apuntan a un commit concreto; las actualizaciones se publican como nuevos commits con sus propios hashes.
- El modelo se distribuye sin garantías de soporte ni mantenimiento por parte del autor del repositorio (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tomtia/Intern-Decision-4B-GGUF
- Modelo base: https://huggingface.co/internlm/Intern-Decision-4B
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.5-4B
- Conversión GGUF de referencia: https://huggingface.co/bombdefuser-124/Intern-Decision-4B-GGUF/tree/0b1dc0b4a5b7eed290f662644237f5ee3694f260
- Resultado de búsqueda web no relacionado con el modelo (descartado): https://www.assurancesvoyage.fr/ava-assurance-voyage/
