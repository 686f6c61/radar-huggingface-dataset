# wizionic/Wizionic3.5-0.8B-router

## Resumen

Wizionic3.5-0.8B-router es un modelo de lenguaje especializado de pequeno tamano (752 millones de parametros) desarrollado por el usuario wizionic. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B orientado exclusivamente al enrutamiento de herramientas y modulos dentro de la aplicacion Wizionic. El modelo no ejecuta llamadas a herramientas ni rellena argumentos: su unica funcion es decidir que modulos deben adjuntarse a un mensaje de usuario y devolver un objeto JSON corto con esa decision.

La relevancia de este modelo es acotada y deliberada: no compite como modelo de proposito general, sino que resuelve una tarea de enrutamiento concreta dentro de un pipeline de agentes. Su tamano reducido lo hace desplegable en hardware modesto, y su licencia Apache 2.0 permite integracion comercial sin restricciones adicionales.

La informacion publica disponible es escasa: la model card no detalla la composicion del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. Los datos tecnicos se limitan a lo declarado en la ficha de Hugging Face y al contenido de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M y Q4_K_M (GGUF); pesos base en safetensors disponibles en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q5_K_M, Q4_K_M) y safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parametros. La model card no especifica la arquitectura interna del modelo base (atencion, capas, dimensiones ocultas) ni los detalles del proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT.

La unica innovacion tecnica declarada es la especializacion en un esquema de enrutamiento propietario de la aplicacion Wizionic: el modelo emite un objeto JSON corto que indica que modulos deben activarse para un mensaje dado. La model card indica explicitamente que el modo de razonamiento (thinking) debe desactivarse durante la inferencia.

## Capacidades

- Enrutamiento de herramientas y modulos: dado un mensaje de usuario, decide que modulos de la aplicacion Wizionic deben adjuntarse y devuelve un JSON con esa decision.
- Salida estructurada: produce objetos JSON cortos conforme al esquema de enrutamiento de Wizionic.
- No ejecuta llamadas a herramientas ni rellena argumentos: la model card lo declara explicitamente fuera de su alcance.
- No esta disenado como modelo de chat de proposito general.
- Capacidades multilingues: no disponibles (sin datos en la model card).
- Capacidades especiales: thinking desactivado por diseno en el uso previsto; sin soporte declarado de vision o audio.

## Casos de uso

- Enrutamiento de modulos en Wizionic: el modelo recibe el mensaje del usuario y devuelve el JSON que indica que modulos adjuntar al pipeline del agente. Es su caso de uso principal y el unico documentado.
- Preprocesado de intenciones en pipelines de agentes: integrado como primer eslabon antes de un modelo mayor, reduce el coste de decidir que capacidades activar por consulta.
- Despliegue en local con Ollama o Lemonade: la model card indica que esta pensado para cargarse con Lemonade u Ollama, lo que permite ejecutarlo en estaciones de trabajo sin GPU dedicada.
- Filtrado de consultas en produccion: al devolver una decision compacta en JSON, puede insertarse en un middleware que seleccione herramientas antes de invocar al modelo generativo principal.
- Prototipado de esquemas de routing: sirve como referencia para equipos que construyen su propio enrutador de herramientas sobre un modelo pequeno de la familia Qwen.
- Inferencia con requisitos de latencia baja: al ser un modelo de 0.8B con cuantizacion Q4_K_M, es viable en CPU y en GPUs de gama de entrada para decisiones de enrutamiento por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, aproximadamente 0.5 GB de pesos; con Q5_K_M, aproximadamente 0.6 GB. La VRAM total depende del contexto configurado y del runtime.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente; tambien es viable en CPU.
- GPU de consumo: cabe en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Ollama y Lemonade segun la model card; al estar en formato GGUF, tambien es compatible con llama.cpp y otros runtimes GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wizionic3.5-0.8B-router | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune especializado en routing para Wizionic |
| Qwen/Qwen3.5-0.8B (base) | ~0.8 B | no disponible | no disponible en la informacion | safetensors | Modelo base; capacidades generales no documentadas aqui |
| Alternativas de routing de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de proposito especifico: la model card advierte que no se recomienda como modelo de chat de proposito general.
- No ejecuta herramientas ni rellena argumentos; solo decide que modulos adjuntar.
- Dependencia del esquema de Wizionic: el JSON de salida esta optimizado para el esquema exacto de esa aplicacion, lo que limita su reutilizacion fuera de ella.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingue.
- Longitud de contexto no documentada; el rendimiento en conversaciones largas es desconocido.
- Riesgo de alucinacion en la salida JSON no evaluado: no hay benchmarks publicados que midan la precision del enrutamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen puede tener sus propias condiciones que conviene verificar antes de production.
- El modo thinking debe desactivarse; usarlo activado puede degradar la calidad de la salida segun la model card.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/wizionic/Wizionic3.5-0.8B-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio de Wizionic: https://wizionic.com
- Ollama: https://ollama.com
- Lemonade: no disponible en la informacion proporcionada
