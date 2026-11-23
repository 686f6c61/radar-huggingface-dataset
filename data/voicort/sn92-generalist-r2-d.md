# voicort/sn92-generalist-r2-d

## Resumen
sn92-generalist-r2-d es un ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, publicado por el usuario voicort en Hugging Face. Se distribuye como un modelo de tipo image-text-to-text orientado a la toma de decisiones y clasificacion de texto, con la etiqueta de arquitectura "gemma4" y compatibilidad con transformers. Cuenta con 31.273.088.876 parametros (aproximadamente 31,3 mil millones) y un repositorio de 62,6 GB en formato safetensors.

El modelo se presenta bajo una licencia Apache 2.0, aunque el acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de poder descargarlo. La informacion publica disponible es muy limitada: no se detallan idiomas soportados, datos de entrenamiento, benchmarks ni una descripcion funcional completa mas alla de las etiquetas asociadas.

Por su tamano y su orientacion declarada hacia la clasificacion y la decision, resulta relevante para quienes exploran modelos de gran escala aplicados a tareas de enrutamiento, clasificacion multimodal o sistemas de decision automatizada, si bien la ausencia de documentacion tecnica obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (segun etiquetas del repositorio); transformer, detalles no disponibles |
| Parametros totales | 31.273.088.876 (aproximadamente 31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La informacion disponible indica que el modelo deriva de MachinePulseAI/karpo-decision-31B mediante un fine-tune, y que las etiquetas del repositorio apuntan a una arquitectura denominada "gemma4" dentro del ecosistema transformers. No se especifican detalles sobre el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la naturaleza exacta de la tarea de ajuste (mas alla de las etiquetas "decision-model", "reax" y "text-classification"). El pipeline declarado es text-classification, aunque el repositorio tambien incluye la etiqueta image-text-to-text, lo que sugiere capacidades multimodales no documentadas en detalle.

## Capacidades
- Clasificacion de texto: el pipeline declarado es text-classification, orientado a etiquetar o categorizar entradas.
- Procesamiento image-text-to-text: la etiqueta del repositorio sugiere entrada conjunta de imagen y texto, aunque no se detalla el alcance.
- Toma de decisiones: las etiquetas "decision-model" y "reax" apuntan a un uso como modelo de decision o enrutamiento.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede desplegarse en infraestructura de inferencia compatible con la API de Hugging Face.
- Generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso
- Clasificacion de tickets de soporte: el modelo puede emplearse para asignar categorias o prioridades a entradas de texto, aprovechando su pipeline de text-classification.
- Enrutamiento de consultas en sistemas de decision: las etiquetas "decision-model" y "reax" sugieren su uso para decidir la accion o el flujo siguiente ante una entrada dada.
- Filtrado y moderacion de contenido: clasificacion de textos entrantes en categorias predefinidas antes de su procesamiento posterior.
- Procesamiento de documentos con imagen y texto: la etiqueta image-text-to-text permite explorar la clasificacion de capturas, formularios o documentos escaneados acompanados de texto.
- Despliegue en endpoints gestionados: gracias al tag "endpoints_compatible", puede integrarse en infraestructura de inferencia estandar sin adaptaciones profundas.
- Base para ajustes posteriores: al ser un fine-tune de karpo-decision-31B, puede servir como punto de partida para especializaciones adicionales en tareas de clasificacion o decision.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 31,3 B parametros, en precision completa (fp32) se requieren aproximadamente 125 GB; en bf16/fp16, alrededor de 62 GB; en cuantizacion de 8 bits, unos 31 GB; en 4 bits, aproximadamente 16-18 GB. Estas cifras son estimaciones tecnicas basadas en el numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para bf16, GPUs con 80 GB como A100 o H100; para cuantizaciones de 8 y 4 bits, A100 40 GB, L40S o configuraciones multi-GPU.
- GPU de consumo: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) de forma ajustada; en 8 bits no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de contexto del modelo, por lo que la comparativa se limita a caracteristicas estructurales conocidas del propio modelo. No se identifican en la informacion proporcionada modelos alternativos concretos de la misma categoria con los que comparar de forma fiable.

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| sn92-generalist-r2-d | 31,3 B | no disponible | Apache 2.0 | Restringido (gated) |
| MachinePulseAI/karpo-decision-31B (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Documentacion practicamente inexistente: no hay model card detallada, benchmarks ni descripcion de datos de entrenamiento, lo que dificulta evaluar su calidad real.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que anade friccion a la adopcion y a la reproducibilidad.
- Riesgo de alucinacion: al no documentarse el entrenamiento ni el ajuste, no puede acotarse el riesgo de respuestas incorrectas o inventadas.
- Idiomas: se desconoce que idiomas cubre; no debe asumirse soporte del castellano ni de otros idiomas.
- Contexto: se desconoce la longitud de ventana, lo que impide planificar usos con entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base (MachinePulseAI/karpo-decision-31B), cuyo regimen de licencia no se detalla en la informacion disponible.
- Produccion: la falta de datos sobre latencia, cuantizacion y estabilidad desaconseja su uso en sistemas criticos sin una evaluacion previa propia.
- Sesgos: no disponible.

## Enlaces
- Hugging Face: https://huggingface.co/voicort/sn92-generalist-r2-d
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B (referenciado en las etiquetas; no verificado en la informacion proporcionada)
- Papers, blogs, repositorios o demos adicionales: no disponible
