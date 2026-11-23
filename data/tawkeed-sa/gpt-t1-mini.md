# tawkeed-sa/gpt-t1-mini

## Resumen

GPT T1 Mini es el modelo de lenguaje del dispositivo Tawkeed T1 Mini, el miembro de menor tamano de la familia GPT T1 desarrollada por Tawkeed (tawkeed.ai). Se trata de un modelo denso de 27.781.427.952 parametros (27,8B) con arquitectura hibrida de atencion lineal y atencion completa, disenado para ejecutarse en una unica GPU NVIDIA RTX PRO 4500 Blackwell (32 GB) o RTX PRO 5000 Blackwell (48 GB). Acepta entrada de texto e imagenes y declara una longitud de contexto de 262.144 tokens.

El modelo se presenta como un derivado de Qwen/Qwen3.8-27B. Es importante senalar que el repositorio actual de Hugging Face contiene, segun la propia model card, los pesos originales en BF16 de Qwen3.8-27B sin modificar (unos 55,6 GB), que superan la memoria de la GPU del dispositivo. La build cuantizada a 4 bits especifica para el dispositivo, quantizada por Tawkeed, aun no se ha publicado. Por tanto, lo disponible hoy es material fuente para cuantizacion o pesos ejecutables en hardware con suficiente VRAM, no una version optimizada para el T1 Mini.

La relevancia del proyecto radica en su enfoque de despliegue en hardware de borde con una sola GPU de 32-48 GB, combinando una ventana de contexto muy amplia con capacidad multimodal. La licencia Apache-2.0 facilita el uso comercial, si bien la ausencia de benchmarks propios y de pesos especificos publicados limita de momento la evaluacion practica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (lineal y completa); etiquetado como qwen3_5 |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (pesos actuales); build a 4 bits anunciada por Tawkeed, no publicada |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 55,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa con un esquema hibrido de atencion que combina capas de atencion lineal con capas de atencion completa, segun la model card. Esta combinacion suele buscar un equilibrio entre eficiencia computacional en contextos largos y calidad de recuperacion de informacion. El pipeline declarado es image-text-to-text, lo que implica un codificador o proyector multimodal que permite procesar imagenes ademas de texto.

Los pesos publicados corresponden a los originales en BF16 de Qwen/Qwen3.8-27B, sin modificaciones por parte de Tawkeed. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o variantes de atencion mas alla de la mencion hibrida. La model card indica que la build cuantizada a 4 bits reemplazara a los pesos actuales en el repositorio.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Procesamiento de imagenes junto con texto (image-text-to-text), lo que habilita descripcion visual, respuesta a preguntas sobre imagenes y tareas multimodales.
- Razonamiento y comprension de contexto largo gracias a una ventana de 262.144 tokens.
- Capacidad potencial de generacion de codigo y matematicas heredada del modelo base Qwen3.8-27B, aunque no se documenta explicitamente en la model card.
- Soporte multilingue limitado a arabe e ingles segun los metadatos declarados.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades de audio.

## Casos de uso

- Atencion al cliente en arabe e ingles: el modelo puede mantener conversaciones multi-turno con un contexto de 262.144 tokens, lo que permite conservar historiales extensos y documentacion de referencia en una sola ventana sin truncamientos agresivos.
- Analisis de documentos e imagenes escaneadas: al aceptar entrada image-text-to-text, puede extraer y resumir informacion de capturas, formularios o diagramas acompanados de instrucciones textuales.
- Despliegue en estaciones de trabajo con una sola GPU: pensado para el dispositivo Tawkeed T1 Mini con una RTX PRO 4500 o 5000 Blackwell, encaja en escenarios de inferencia local en oficina o laboratorio sin infraestructura de centro de datos.
- Asistencia sobre bases de conocimiento extensas: la ventana de 262.144 tokens permite incluir manuales tecnicos o contratos completos como contexto para responder consultas concretas.
- Prototipado multimodal en investigacion: al estar bajo Apache-2.0 y en formato safetensors compatible con transformers, sirve como base para experimentos de vision-lenguaje y para generar builds cuantizadas propias.
- Generacion y revision de contenido bilingue arabe-ingles: util para localizacion, redaccion tecnica y traduccion asistida en entornos corporativos que operan en ambos idiomas.
- Fuente para cuantizacion a 4 bits: el repositorio actual, con los pesos BF16 originales, puede emplearse como material de partida para producir versiones comprimidas destinadas a hardware con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para los pesos, mas memoria adicional para cache KV y activaciones; requiere por tanto GPUs de 80 GB o configuraciones multi-GPU para ejecucion comoda.
- VRAM estimada para la build a 4 bits anunciada: en torno a 14-16 GB para los pesos, compatible con la GPU de 32 GB del dispositivo T1 Mini; no publicada aun.
- GPU objetivo del dispositivo: una NVIDIA RTX PRO 4500 Blackwell (32 GB) o RTX PRO 5000 Blackwell (48 GB).
- GPU recomendadas para los pesos BF16 actuales: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU.
- En GPU de consumo: los pesos BF16 no caben en tarjetas como RTX 4090 (24 GB); seria necesaria cuantizacion a 4 bits, aun no disponible en el repositorio.
- Opciones de despliegue: la model card remite a las instrucciones de servicio de Qwen/Qwen3.8-27B; al ser pesos compatibles con transformers y safetensors, son aplicables stacks como vLLM o TGI con soporte para la arquitectura del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| GPT T1 Mini (tawkeed-sa) | 27,8B denso | 262.144 | Texto e imagen | Apache-2.0 | BF16 de Qwen3.8-27B; build 4 bits pendiente |
| Qwen/Qwen3.8-27B (base) | 27,8B denso | 262.144 | Texto e imagen | Apache-2.0 | Completa (origen de los pesos) |
| GPT T1 (tawkeed-sa) | Qwen3.5-122B-A10B (MoE) | No disponible | No disponible | Apache-2.0 | No disponible en la informacion |
| GPT T1 Max (tawkeed-sa) | Qwen3.5-397B-A17B (MoE) | No disponible | No disponible | Apache-2.0 | No disponible en la informacion |

En la practica, GPT T1 Mini es funcionalmente identico a Qwen/Qwen3.8-27B en su estado actual, ya que los pesos no han sido modificados. La diferenciacion llegara con la build a 4 bits especifica para el dispositivo T1 Mini.

## Limitaciones y advertencias

- Los pesos publicados son los originales de Qwen3.8-27B en BF16 y no caben en la GPU del dispositivo T1 Mini; no constituyen todavia una version lista para produccion en ese hardware.
- No se han publicado benchmarks propios ni evaluaciones de la build cuantizada, por lo que el rendimiento real en el dispositivo es desconocido.
- Idiomas declarados limitados a arabe e ingles; el rendimiento en castellano u otras lenguas no esta documentado y puede degradarse.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin documentacion de mitigaciones especificas por parte de Tawkeed.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineamiento, lo que dificulta evaluar riesgos eticos y de seguridad.
- Aunque la licencia es Apache-2.0, conviene revisar el archivo LICENSE del repositorio y las obligaciones de atribucion respecto al modelo base Qwen.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; se trata de una publicacion muy reciente y sin validacion comunitaria.
- La ausencia de soporte documentado de tool calling o comportamiento agentico limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tawkeed-sa/gpt-t1-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GPT T1: https://huggingface.co/tawkeed-sa/gpt-t1
- GPT T1 Max: https://huggingface.co/tawkeed-sa/gpt-t1-max
- Sitio del autor: https://tawkeed.ai
