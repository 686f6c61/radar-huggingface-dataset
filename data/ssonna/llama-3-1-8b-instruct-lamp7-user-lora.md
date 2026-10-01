# ssonna/Llama-3.1-8B-Instruct-LaMP7-user-LoRA

## Resumen

Llama-3.1-8B-Instruct-LaMP7-user-LoRA es una colección de 1496 adaptadores LoRA independientes entrenados sobre `meta-llama/Llama-3.1-8B-Instruct`, uno por cada usuario del split de test de LaMP-7, la tarea de parafraseo de tuits del benchmark LaMP. Cada adaptador se ha ajustado únicamente con el historial de perfil de ese usuario concreto, siguiendo el esquema de personalización conocido como OPPU (un PEFT por usuario). El modelo base permanece congelado y no se distribuye en este repositorio: lo que se publica son los pesos de los adaptadores.

El problema que aborda es la personalización extrema a nivel de individuo sin reentrenar el modelo completo: en lugar de un único modelo genérico, se despliega un adaptador ligero por usuario que captura su estilo y sus preferencias, y se activa en tiempo de inferencia. Es relevante para investigación en personalización, para la reproducibilidad de resultados sobre LaMP-7 y para arquitecturas multi-tenant donde miles de adaptadores comparten una misma instancia del modelo base.

Técnicamente son adaptadores de rango 8 (alpha 8, dropout 0.05) aplicados sobre `q_proj` y `v_proj`, con pesos en float32 y el modelo base en bfloat16. Al apoyarse en Llama 3.1 8B, heredan la ventana de contexto de 128 000 tokens y la licencia Llama 3.1 Community License. El repositorio declara 20,4 GB de tamaño, una cifra anómala para adaptadores de este rango que conviene verificar antes de descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (Llama 3.1) con Grouped-Query Attention; adaptadores LoRA (PEFT) sobre `q_proj` y `v_proj` |
| Parámetros totales | 8 000 millones aproximadamente en el modelo base (no incluido en el repositorio); adaptadores de rango 8, sin recuento de parámetros publicado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantización | No disponible (los adaptadores se publican en float32 dentro de safetensors; no hay versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible en la model card; el modelo base declara ocho idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), formato PEFT/LoRA |
| Número de adaptadores | 1496, uno por usuario del split de test de LaMP-7 |
| Tarea objetivo | LaMP-7: parafraseo de tuits personalizado |
| Tamaño del repositorio | 20,4 GB (según HuggingFace) |
| Librería | peft |
| Fecha de creación | 1 de octubre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.1 8B Instruct, un transformer decoder-only autorregresivo con Grouped-Query Attention y 8 000 millones de parámetros, preentrenado por Meta sobre aproximadamente 15 billones de tokens con corte de conocimiento en diciembre de 2023 y posteriormente ajustado por instrucciones y preferencias. Sobre él se aplican adaptadores LoRA que no modifican los pesos base: la matriz de bajo rango se suma a las proyecciones `q_proj` y `v_proj` de cada capa de atención.

El entrenamiento de cada adaptador, según la model card, usa rango 8, alpha 8, dropout 0.05 y los módulos objetivo `q_proj` y `v_proj`. El optimizador es AdamW con tasa de aprendizaje 0.0001, weight decay 0.01, schedule lineal, ratio de warmup 0.1 y recorte de gradiente 0.3. Se entrena una sola época con tamaño de lote efectivo 8, pérdida de entropía cruzada restringida a la completion (`completion-only cross entropy`, sin truncamiento), precisión base bfloat16 con pesos del adaptador en float32 y semilla 42. Cada uno de los 1496 adaptadores se ajustó exclusivamente con el historial de perfil de un único usuario del split de test, en la línea del enfoque OPPU, de modo que el modelo base nunca ve datos de otros usuarios durante el ajuste de ese adaptador.

La innovación principal no es arquitectónica sino de organización del artefacto: el repositorio separa los adaptadores en `users/<folder>/adapter/` e incluye un `index.jsonl` que mapea carpeta, `user_id`, identificadores de consulta, número de elementos del historial y `sha256`. El nombre de carpeta es el resultado de los primeros 24 caracteres hexadecimales del SHA-256 del `user_id` codificado en JSON, lo que permite localizar el adaptador de un usuario sin ambigüedad ni colisiones de nombres.

## Capacidades

- Generación de texto en inglés con el estilo y las preferencias del usuario correspondiente al adaptador cargado.
- Parafraseo de tuits personalizado: la tarea para la que se entrenó cada adaptador (LaMP-7).
- Ajuste fino supervisado por usuario con pérdida calculada solo sobre la respuesta, lo que concentra el aprendizaje en la generación objetivo.
- Herencia de las capacidades del modelo base: instrucciones, razonamiento, matemáticas y generación de código, aunque no se han validado específicamente con los adaptadores activos.
- Seguimiento de instrucciones conversacionales multi-turno gracias a la ventana de contexto de 128 000 tokens del modelo base.
- Capacidad multilingüe potencial derivada del modelo base (ocho idiomas oficiales), no documentada para estos adaptadores.
- Soporte de tool calling y function calling a nivel de modelo base (Llama 3.1 lo declara), no verificado sobre los adaptadores.
- Conmutación de personalidad en tiempo de inferencia: es posible cargar y descargar adaptadores por petición sin tocar los pesos base.
- Sin capacidades de visión ni de audio: Llama 3.1 8B es exclusivamente de texto.
- Sin modo de razonamiento extendido (thinking mode) explícito.

## Casos de uso

- Investigación en personalización reproducible: cargar el adaptador del usuario indicado en `index.jsonl` y reproducir exactamente la configuración de evaluación de LaMP-7 sin reentrenar nada.
- Servicio multi-tenant con miles de usuarios: desplegar una única instancia de Llama 3.1 8B en vLLM con soporte de LoRA dinámico y servir el adaptador adecuado según el `user_id` de cada petición, en lugar de mantener un modelo por cliente.
- Transferencia de estilo para comunicación corporativa: ajustar o reutilizar el patrón de personalización para que las respuestas automáticas de una cuenta reproduzcan el registro y las expresiones habituales de su responsable.
- Asistentes de redes sociales: generar variantes de un mensaje breve manteniendo la voz del usuario, útil en herramientas de programación de publicaciones.
- Estudio comparativo de métodos PEFT: usar los 1496 adaptadores como línea base frente a otras técnicas de personalización (prompting con historial, RAG sobre el perfil o fine-tuning completo) bajo idéntico modelo base.
- Análisis de memorización y privacidad: como cada adaptador se entrenó solo con datos de un usuario, el repositorio permite auditar en qué medida un adaptador de bajo rango retiene información específica de su historial.
- Ablación de hiperparámetros de LoRA: la configuración es homogénea (rango 8, alpha 8, una época, semilla 42), lo que facilita comparaciones controladas variando un único factor.
- Generación de datos sintéticos con estilo personalizado: producir ejemplos de parafraseo con la voz de cada usuario para aumentar datasets de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el procedimiento de entrenamiento y la estructura del repositorio, pero no incluye métricas sobre LaMP-7 (por ejemplo ROUGE) ni sobre evaluaciones generales como MMLU o HumanEval, ni comparaciones con el modelo base sin adaptador. Cualquier cifra que se cite debe obtenerse ejecutando la evaluación de forma independiente.

## Requisitos de hardware

- VRAM para el modelo base en bfloat16: en torno a 16 GB solo para pesos, más el coste de la caché KV para la ventana de 128 000 tokens.
- VRAM en cuantización de 8 bits: aproximadamente 9 GB; en 4 bits (bitsandbytes o GPTQ/AWQ), aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB u H100 para lotes grandes y contexto largo; L40S o A6000 para servicio con contexto moderado; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16, y en tarjetas de 8-12 GB si se cuantiza el modelo base a 4 bits. Los adaptadores en sí son pequeños y no cambian la huella de memoria de forma significativa.
- Cálculo estimado del adaptador: con rango 8 sobre `q_proj` (4096x4096) y `v_proj` (1024x4096) en Llama 3.1 8B, cada adaptador ronda los 106 000 parámetros, es decir unos 0,4 MB en float32. Los 1496 adaptadores sumarían aproximadamente 0,64 GB, muy por debajo de los 20,4 GB que declara el repositorio; conviene inspeccionar el contenido antes de planificar el almacenamiento.
- Opciones de despliegue: transformers + peft para uso puntual; vLLM con soporte multi-LoRA para servir muchos adaptadores sobre una instancia; TGI como alternativa de servidor. llama.cpp y Ollama requieren convertir el modelo base a GGUF y gestionan LoRA de forma menos cómoda, por lo que no son la vía natural para 1496 adaptadores.
- Latencia y throughput: no disponibles. El coste adicional de activar un adaptador LoRA de rango 8 es marginal frente a la inferencia del modelo base, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-LaMP7-user-LoRA | 8 000 M (base) + LoRA rango 8 | 128 000 tokens (base) | Llama 3.1 Community License | Personalización por usuario (1496 adaptadores) | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8 000 M | 128 000 tokens | Llama 3.1 Community License | Modelo instruct generalista | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7 600 M aproximadamente | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | Modelo instruct generalista multilingüe | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7 200 M aproximadamente | 32 000 tokens | Apache 2.0 | Modelo instruct generalista | HuggingFace |

No hay datos de rendimiento comparativos publicados para esta colección de adaptadores, por lo que la comparación se limita a parámetros, contexto, licencia y modelo de distribución. Frente a los modelos instruct generalistas, la diferencia no está en las capacidades base sino en que aquí el artefacto distribuido es un conjunto de adaptadores de personalización que requiere el modelo base de Meta para funcionar.

## Limitaciones y advertencias

- Los adaptadores no son un modelo autónomo: sin `meta-llama/Llama-3.1-8B-Instruct` no se pueden ejecutar, y ese modelo debe descargarse por separado y acepta su propia licencia.
- Están atados a un `user_id` concreto del split de test de LaMP-7; no existe un adaptador genérico ni forma de generalizar a un usuario nuevo sin entrenar uno nuevo.
- Riesgo de sobreajuste al historial personal: al entrenarse con datos de un solo individuo durante una época y con rango 8, el adaptador puede degradar el seguimiento general de instrucciones en favor del estilo aprendido.
- Posible memorización de contenido personal presente en los historiales de perfil, con implicaciones de privacidad si los adaptadores se despliegan o redistribuyen.
- La model card no documenta evaluación alguna, ni cuantitativa ni cualitativa, sobre la calidad del parafraseo resultante.
- No se declaran idiomas soportados para estos adaptadores; los datos de LaMP-7 son tuits en inglés, por lo que el comportamiento fuera del inglés es incierto.
- El repositorio declara 20,4 GB, una cifra incoherente con el tamaño teórico de los adaptadores; verificar el contenido real antes de descargar o de dimensionar almacenamiento.
- La licencia Llama 3.1 Community License impone condiciones al uso comercial, exige mantener los avisos de atribución y prohíbe usos recogidos en la política de uso aceptable de Meta; conviene revisar `LICENSE`, `USE_POLICY.md` y `Notice`.
- El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validación independiente por parte de la comunidad.
- La fecha de creación registrada (1 de octubre de 2026) es posterior a la de publicación de los modelos base y de los benchmarks citados; conviene confirmar la procedencia de los metadatos.
- Gestionar 1496 adaptadores exige una infraestructura con soporte multi-LoRA real (por ejemplo vLLM); cargarlos todos simultáneamente en memoria no es viable en hardware de consumo.
- Las capacidades de tool calling, agentes y razonamiento multi-paso que se atribuyen al modelo base no han sido verificadas con los adaptadores activos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssonna/Llama-3.1-8B-Instruct-LaMP7-user-LoRA
- Modelo base instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base preentrenado: https://huggingface.co/meta-llama/Llama-3.1-8B
- Ficha y casos de uso de Llama-3.1-8B-Instruct: https://www.aimodels.fyi/models/huggingFace/llama-3.1-8b-instruct-meta-llama
- Guía de despliegue local de Llama-3.1-8B: https://aiindigo.com/tutorials/getting-started-with-llama-3-1-8b-local-deployment-inference
- Artículo del benchmark LaMP (Salemi et al.): https://arxiv.org/abs/2304.11406
- Enlace al artículo de OPPU (One PEFT Per User) citado en la model card: no disponible
- Enlaces a paper o blog propios de los adaptadores: no disponible en la información proporcionada
