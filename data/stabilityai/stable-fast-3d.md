# stabilityai/stable-fast-3d

## Resumen

Stable Fast 3D (SF3D) es un modelo de reconstrucción de mallas 3D desarrollado por Stability AI que transforma una única imagen de entrada en un activo 3D completo en aproximadamente 0,5 segundos. El modelo se presentó en julio de 2024 y representa una evolución directa de TripoSR, del que hereda la arquitectura base, incorporando técnicas nuevas para optimizar explícitamente la generación de mallas de alta calidad, incluyendo materiales, UVs y desentrelazado de iluminación.

El modelo resuelve el problema de la generación de activos 3D rápida y accesible, un cuello de botella clásico en el pipeline de producción de gráficos por computador, juegos, realidad aumentada y comercio electrónico. Su relevancia radica en que ofrece una reconstrucción feedforward (sin optimización iterativa) en menos de un segundo, algo que hasta hace poco requería minutos con métodos basados en optimización o reconstrucción multi-vista.

Está publicado con acceso restringido en Hugging Face bajo la licencia `stabilityai-community`, con aproximadamente 1 000 millones de parámetros y un tamaño de repositorio de 4,6 GB en formato `safetensors`. El modelo se entrenó sobre el dataset `allenai/objaverse` y se documenta en el paper arXiv 2408.00653.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feedforward basado en TripoSR, con módulos de reconstrucción de malla, estimación de materiales y UV-unfolding |
| Parametros totales | 1.006.027.436 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin entrada de texto) |
| Licencia | stabilityai-community (acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Fast 3D se basa en la arquitectura de TripoSR, un modelo de reconstrucción feedforward de mallas que procesa una imagen y produce una geometría 3D en una única pasada. Sobre esa base, los autores introducen varias innovaciones clave: un módulo de desentrelado de iluminación que separa el albedo de la luz ambiente, un sistema de generación de UVs que produce texturas coherentes, y una pérdida de entrenamiento optimizada para producir mallas con buena topología y sin artefactos.

El entrenamiento se realizó sobre el dataset Objaverse, una colección a gran escala de objetos 3D sintéticos. El paper arXiv 2408.00653 detalla el proceso, que incluye un entrenamiento supervisado con pares imagen-malla y un refinamiento específico para la calidad de la malla resultante. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre técnicas de RLHF o DPO, que por otro lado no son habituales en modelos de visión.

La principal innovación técnica es la reconstrucción feedforward rápida (0,5 segundos en hardware estándar) combinada con la generación directa de UVs y materiales, lo que evita los pasos de postprocesado típicos de otros métodos.

## Capacidades

- Generación de mallas 3D completas a partir de una única imagen RGB.
- Estimación de materiales PBR (albedo, metálico, rugosidad) integrada en la salida.
- Generación de UVs y texturas sin necesidad de desplegado manual.
- Desentrelado de iluminación: separa la luz del albedo, permitiendo reluminación posterior.
- Reconstrucción en menos de un segundo en GPU estándar.
- Compatible con salida en formatos de malla estándar (OBJ, glTF, etc.) mediante el repositorio oficial.
- Sin soporte de texto, tool calling ni agentes: es un modelo de visión puro.

## Casos de uso

- Prototipado rápido en diseño de producto: un diseñador puede fotografiar un boceto o un objeto físico y obtener una malla 3D editable en menos de un segundo para iterar sobre la forma en herramientas de modelado.
- Generación de activos para videojuegos: permite crear props y elementos de entorno a partir de concept art o fotos de referencia, reduciendo el tiempo de modelado manual.
- Visualización de producto en comercio electrónico: a partir de una foto de catálogo, se genera una malla 3D que puede mostrarse interactivamente en la web del comercio, mejorando la experiencia de compra.
- Realidad aumentada y realidad virtual: los activos generados pueden integrarse en escenas AR/VR para simular objetos reales en entornos virtuales.
- Preservación y documentación cultural: a partir de fotografías de piezas arqueológicas o patrimoniales, se generan modelos 3D para su archivo digital y difusión sin necesidad de escáneres 3D caros.
- Impresión 3D: una foto de un objeto existente se convierte en una malla imprimible, aunque requiere un postprocesado de verificación de malla y escala.
- Producción de VFX y animación: los artistas pueden generar rápidamente objetos de referencia o props para escenas, acelerando el blocking y la previsualización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper arXiv 2408.00653 incluye comparaciones con TripoSR y otros métodos, pero no se proporcionan cifras concretas en la documentación pública del repositorio. Stability AI afirma que el modelo mejora la calidad de malla y la velocidad respecto a TripoSR, pero sin datos numéricos verificables en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica un valor oficial. Con 1.006 millones de parámetros, el modelo en FP16 ocupa aproximadamente 2 GB de pesos, pero la inferencia completa con procesamiento de imagen y generación de malla puede requerir entre 4 y 8 GB de VRAM según la resolución de salida.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM debería ser suficiente para inferencia, incluyendo RTX 3060, RTX 4060, RTX 4070, y en el rango profesional A100 o H100 para producción a gran escala.
- Cabe en GPUs de consumo: sí, las GPUs de gama media con 8 GB o más pueden ejecutar el modelo.
- Opciones de despliegue: el repositorio oficial de GitHub proporciona un pipeline en PyTorch. No hay soporte nativo para vLLM, Ollama ni TGI, ya que es un modelo de visión, no de lenguaje.
- Latencia: aproximadamente 0,5 segundos por imagen en hardware estándar, según la documentación de Stability AI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Velocidad | Licencia | Notas |
|---|---|---|---|---|---|
| Stable Fast 3D | 1,006 B | imagen a 3D | ~0,5 s | stabilityai-community (gated) | Genera malla, materiales y UVs |
| TripoSR | no disponible | imagen a 3D | ~0,5 s | MIT (según repo) | Predecesor directo, sin materiales ni UVs |
| One-2-3-45 | no disponible | imagen a 3D | minutos | MIT | Método clásico basado en reconstrucción multi-vista, más lento |

La comparación directa con TripoSR es la más relevante, ya que SF3D es una evolución del mismo. Stability AI no publica cifras comparativas en la información accesible, pero indica que SF3D produce mallas de mayor calidad y añade materiales y UVs, algo que TripoSR no ofrecía.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar las condiciones de la licencia `stabilityai-community`, que pueden incluir restricciones de uso comercial. Verificar los términos antes de desplegar en producción.
- Riesgo de alucinación geométrica: en imágenes con oclusiones, reflexiones o geometría ambigua, el modelo puede generar mallas incorrectas o con artefactos.
- Limitaciones de entrada: el modelo está optimizado para objetos individuales y puede fallar con escenas complejas, múltiples objetos o fondos muy ruidosos.
- Calidad de malla variable: la salida puede requerir postprocesado (remallado, reducción de polígonos, retopología) para uso en pipelines profesionales de animación o juegos.
- Sin soporte de texto: no acepta prompts de texto; la entrada es estrictamente una imagen.
- Dependencia de hardware: aunque funciona en GPUs de consumo, la calidad de la malla y la velocidad pueden variar según la VRAM disponible.
- No se han publicado detalles de sesgos o evaluaciones de robustez en la información disponible.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/stabilityai/stable-fast-3d
- Página oficial del proyecto: https://www.stablefast3d.com/
- Repositorio GitHub oficial: https://github.com/Stability-AI/stable-fast-3d
- Anuncio de Stability AI: https://stability.ai/news-updates/introducing-stable-fast-3d
- Paper arXiv: https://arxiv.org/abs/2408.00653
- Colección 3D de Stability AI: https://huggingface.co/collections/stabilityai/3d
