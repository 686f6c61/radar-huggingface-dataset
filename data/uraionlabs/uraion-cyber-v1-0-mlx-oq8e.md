# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ8e

## Resumen
Uraion Cyber V1.0 MLX oQ8e es una cuantización de 8 bits en formato MLX del modelo Uraion Cyber V1.0, desarrollado por Uraion Labs. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos por token, distribuidos en 256 expertos con 8 enrutados por token, y una ventana de contexto arquitectónica de 262.144 tokens. Está orientado específicamente a seguridad defensiva y trabajo agéntico: detección de vulnerabilidades, auditoría de código, generación de parches y reconocimiento de código correcto cuando no hay fallo.

La relevancia de esta variante concreta es que permite ejecutar el modelo localmente en Apple Silicon mediante MLX y Metal, sin depender de GPUs NVIDIA ni de servicios en la nube, lo que resulta útil para flujos de auditoría de código sensible que no deberían salir de la máquina del analista. La cuantización se ha generado con la herramienta oMLX 0.7.4.dev1 usando cuantización mejorada por matriz de importancia (imatrix), y conserva el tokenizador, la plantilla de chat, la torre de visión y, si estaban presentes en el checkpoint original, los pesos MTP.

El repositorio contiene únicamente los pesos cuantizados (38,60 GB) y no incluye la metodología de evaluación completa, que remite a la model card del modelo base en BF16. El modelo está etiquetado como multimodal imagen-texto, con licencia MIT y soporte declarado únicamente de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`, familia Qwen3.5/Qwen3.6); incluye torre de visión |
| Parámetros totales | 35.951.822.704 (~35B) |
| Parámetros activos | ~3B por token (256 expertos, 8 enrutados por token) |
| Longitud de contexto | 262.144 tokens (límite arquitectónico, no garantía de memoria) |
| Tipos de cuantización | oQ8e (8 bits con precisión mixta e imatrix); la familia incluye oQ2e, oQ2.5e, oQ2.7e, oQ3e, oQ3.5e, oQ4e, oQ5e, oQ6e y oQ8e |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors MLX (repo de 38,6 GB) |

## Arquitectura y entrenamiento
La arquitectura es un transformer de mezcla de expertos de la familia Qwen3.5 MoE, con 256 expertos y 8 enrutados por token, lo que da unos 3.000 millones de parámetros activos sobre un total de casi 36.000 millones. El modelo incluye torre de visión (pipeline `image-text-to-text`) y conserva los pesos MTP (multi-token prediction) si estaban presentes en el checkpoint fuente, lo que habilita decodificación especulativa en runtimes compatibles.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otros ajustes de preferencia. La model card de esta variante remite explícitamente a la del modelo base BF16 para la metodología de evaluación, los resultados en seguridad sobre conjuntos retenidos y la documentación de seguridad. La innovación técnica destacable de este repositorio es la cuantización: se ha aplicado un esquema oQe con matriz de importancia mejorada generado localmente con oMLX, que asigna precisión de forma no uniforme (precisión mixta) en lugar de un ancho de bits fraccional uniforme, con el objetivo de acercarse a la fidelidad del BF16 a 8 bits.

## Capacidades
- Generación de texto conversacional y razonamiento con modo de pensamiento (*thinking*), según las etiquetas del modelo.
- Detección de vulnerabilidades y auditoría de código (*code audit*, *vulnerability detection*).
- Generación de parches (*patch generation*) y verificación de que el código es correcto cuando no hay fallo.
- Programación general y razonamiento sobre código.
- Llamada a herramientas y funciones (*tool calling*, *function calling*).
- Comportamiento agéntico y razonamiento multi-paso, incluyendo prueba de fallos en sandbox según la descripción del autor.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, torre de visión conservada).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Decodificación especulativa potencial vía pesos MTP, si el runtime los explota.

## Casos de uso
- Auditoría de código en local: el analista pasa un fichero o servicio completo al modelo y le pide identificar una vulnerabilidad explotable, nombrar la función afectada y mostrar la petición que la demuestra, o bien confirmar que el código es sólido. La ventana de 262.144 tokens permite incluir módulos enteros sin trocear.
- Revisión de seguridad en pull requests: integrado como paso de un pipeline de CI/CD, el modelo puede analizar el diff y generar un parche candidato, apoyándose en el soporte de tool calling para consultar el repositorio o ejecutar pruebas.
- Triaje de hallazgos de SAST/DAST: dado el volumen de alertas de un escáner, el modelo puede razonar multi-paso sobre cada hallazgo, descartar falsos positivos y priorizar los explotables, reduciendo la carga del equipo de AppSec.
- Asistente de respuesta a incidentes: con contexto largo, se le puede alimentar con logs, trazas y fragmentos de código para reconstruir la cadena de explotación y proponer mitigaciones, en una máquina local que evita exfiltrar datos sensibles.
- Análisis de capturas y diagramas: gracias a la torre de visión, puede interpretar diagramas de arquitectura o capturas de paneles de administración junto con el código para evaluar superficies de ataque.
- Formación y concienciación en seguridad: generación de ejemplos de código vulnerable con su explicación y su parche correspondiente, ejecutándose en un portátil Apple Silicon sin coste de API.
- Automatización agéntica de parcheo: un agente que, ante una vulnerabilidad confirmada, genera el parche, lo aplica en un sandbox y valida que las pruebas siguen pasando, usando el modo thinking para planificar los pasos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card de esta variante remite a la del modelo base BF16 para los resultados de evaluación en seguridad y la metodología, pero no reproduce cifras concretas.

## Requisitos de hardware
- Pesos de esta variante: 38,60 GB en formato MLX safetensors.
- Memoria unificada sugerida por el autor: 64 GB o más para oQ8e; hay que añadir espacio para macOS, el runtime, las activaciones y la caché KV.
- Plataforma: exclusivamente Apple Silicon con Metal; requiere una instalación actualizada de oMLX o un runtime mlx-vlm compatible con Qwen3.5 MoE.
- No está pensado para GPUs NVIDIA ni para CUDA; para esos entornos habría que usar otras variantes del modelo base (BF16 o GGUF, disponibles en la colección del autor).
- Alternativas de menor huella dentro de la misma familia: oQ6e (30,39 GB, 48 GB+ de memoria), oQ5e (26,22 GB, 36–48 GB), oQ4e (22,13 GB, 32 GB+, recomendado como punto de partida), oQ3.5e (18,75 GB), oQ3e (17,88 GB), oQ2.7e (15,56 GB), oQ2.5e (14,89 GB) y oQ2e (14,08 GB, con pérdida de calidad esperada).
- Despliegue: `omlx serve ./Uraion-Cyber-V1.0-MLX-oQ8e --port 8000`, con API compatible con OpenAI en `/v1`; también se puede cargar el directorio desde el panel de oMLX.
- Latencia y throughput: no disponibles en la información proporcionada.
- El contexto máximo utilizable depende de la memoria disponible y de la configuración del runtime; los 262.144 tokens son el límite arquitectónico, no una garantía de que quepan en memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ8e | ~35B totales, ~3B activos | 262.144 | Seguridad defensiva, auditoría y parcheo | MIT | MLX para Apple Silicon |
| Uraion Cyber V1.0 MLX oQ4e | ~35B totales, ~3B activos | 262.144 | Igual, cuantización de 4 bits | MIT | MLX, 22,13 GB |
| Uraion Cyber V1.0 (BF16) | ~35B totales, ~3B activos | 262.144 | Igual, precisión completa | MIT | Safetensors BF16 y GGUF |
| Modelos Qwen3.5 MoE de propósito general | no disponible en la información | no disponible | Propósito general | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo frente a alternativas de la misma categoría.

## Limitaciones y advertencias
- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: 262.144 tokens es el límite arquitectónico, no una garantía de memoria; con oQ8e y contextos largos la demanda de memoria unificada puede superar los 64 GB.
- Cuantización: oQ8e introduce una pérdida de fidelidad respecto al BF16; el autor indica que es la variante más cercana al original, pero no publica métricas de degradación para esta build.
- Alucinación: no se documentan en esta model card tasas de alucinación ni evaluaciones específicas; en tareas de seguridad, un falso positivo o un parche incorrecto puede tener consecuencias graves, por lo que requiere revisión humana.
- Sesgos: no se dispone de información sobre sesgos evaluados en la información proporcionada.
- Uso comercial: la licencia MIT lo permite, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base.
- Seguridad: es un modelo de seguridad defensiva; su uso para generar exploits o actividades ofensivas no está avalado por la documentación y queda bajo responsabilidad del usuario.
- Plataforma: atado a Apple Silicon y a runtimes MLX; no es portable a CUDA sin recurrir a otras variantes.
- Madurez: repositorio con muy pocas descargas y sin likes en el momento de la consulta, lo que sugiere poca validación externa.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ8e
- Modelo base BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Variante oQ6e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ6e
- Variante oQ5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ4e
- Variante oQ3.5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3.5e
- Variante oQ3e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ3e
- Variante oQ2.7e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e
- Variante oQ2.5e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.5e
- Variante oQ2e: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2e
- Colección Uraion Cyber: https://huggingface.co/collections/UraionLabs/uraion-cyber-6aee3c0f9cd91f015e39b415
- Sitio del autor: https://uraionlabs.com/
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ8e/blob/main/LICENSE
- Informe de cuantización: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ8e/blob/main/oq_imatrix_report.json
