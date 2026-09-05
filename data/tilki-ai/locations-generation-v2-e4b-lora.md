# TILKI-AI/locations-generation-v2-E4B-lora

## Resumen

`locations-generation-v2-E4B-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por TILKI-AI a partir del modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`. Está pensado como componente del sistema TILKI, una plataforma de creación de videojuegos basada en IA que genera mundos vivos de forma procedimental. El adaptador se ha entrenado con Unsloth y TRL, y el autor indica que el entrenamiento fue 2 veces más rápido que una fine-tuning convencional.

El modelo es un checkpoint ligero de 0,4 GB que contiene únicamente los pesos del adaptador LoRA; para su uso es necesario cargar el modelo base Gemma-4 en versión 4-bit. Según su nombre, la especialización del modelo es la generación de localizaciones (`locations`) para entornos de ficción o videojuegos, y soporta exclusivamente el idioma inglés. Su licencia Apache 2.0 y su reducido tamaño lo hacen interesante para desarrolladores que quieran experimentar con generación de contenido narrativo en juegos sin asumir el coste de un modelo completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-4 E4B, base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`) |
| Parámetros totales | No disponible (el adaptador LoRA ocupa 0,4 GB) |
| Parámetros activos | No disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base cuantizado a 4-bit (bnb-4bit); adaptador en safetensors con precisión no especificada |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (adaptador); el modelo base Gemma-4 está sujeto a los términos de uso de Gemma |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo instructivo `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, que a su vez es un modelo Gemma-4 configurado como E4B y cuantizado a 4 bits mediante bnb-4bit. El entrenamiento se llevó a cabo con Unsloth y TRL, y el autor destaca una aceleración de 2 veces en la velocidad de entrenamiento, atribuible a la optimización de Unsloth para fine-tuning con cuantización.

No se proporcionan detalles sobre el conjunto de datos, el número de tokens utilizados, la composición del corpus ni técnicas de alineación (RLHF, DPO, etc.). La innovación principal es el uso de Unsloth para reducir el coste de entrenamiento, lo que permite fine-tuning de un modelo 4-bit con un adaptador ligero de bajo peso.

## Capacidades

- Generación de texto instructivo en inglés, heredada del modelo base Gemma-4 instructivo.
- Especialización aparente en la generación de localizaciones (`locations`) para entornos de juego, según el nombre del modelo y la línea de productos de TILKI.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio; no disponible.
- Multilingüe: solo inglés, según la etiqueta `language` del modelo card.

## Casos de uso

- Generación de descripciones de lugares para videojuegos: el modelo puede producir textos de ciudades, bosques, ruinas u otros escenarios a partir de consignas breves, acelerando el trabajo de diseño de niveles.
- Worldbuilding: creación de lore y detalles geográficos para mundos de ficción, generando coherentemente regiones con identidad propia.
- Redacción de ambientación para misiones: apoyo a game designers en la escritura de textos narrativos que acompañen puntos de interés dentro de una partida.
- Prototipado rápido de contenido en estudios independientes: al ser un adaptador ligero sobre un modelo 4-bit, permite iterar sobre el contenido narrativo sin necesidad de infraestructura pesada.
- Asistencia en simulación de mundos vivos: como componente del sistema TILKI, el modelo puede alimentar la generación procedural de localizaciones que después se integran en la simulación de personajes y eventos.
- Generación de contenido semilla para misiones secundarias: el modelo puede producir variaciones rápidas de localizaciones que sirvan como punto de partida para que los humanistas del estudio las refinen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador LoRA (0,4 GB), por lo que la inferencia requiere cargar el modelo base Gemma-4 E4B en su versión cuantizada 4-bit.
- No se han publicado cifras oficiales de VRAM ni latencia. Dado que el modelo base es de tipo E4B y está cuantizado a 4-bit, su ejecución en GPUs de consumo (por ejemplo, RTX 3090 o RTX 4090) es plausible, pero no se puede confirmar con los datos disponibles.
- Puede desplegarse con Transformers y Text Generation Inference (TGI), ya que es compatible con safetensors. La integración con vLLM requiere cargar el adaptador LoRA sobre el modelo base.
- Al ser un adaptador LoRA, el despliegue en producción implica combinar los pesos del adaptador con el modelo base; no es un checkpoint autónomo.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información proporcionada. No hay datos de rendimiento ni de otros adaptadores de la misma categoría disponibles en el material de referencia.

## Limitaciones y advertencias

- Adaptador LoRA de dominio específico: el modelo no es un modelo completo y depende del modelo base Gemma-4 para funcionar.
- El repositorio no incluye documentación sobre el conjunto de datos ni métricas, lo que dificulta evaluar su calidad.
- Solo soporta el idioma inglés.
- Hereda los sesgos y las limitaciones del modelo base Gemma-4, incluidos los riesgos de alucinación.
- El contenido generado para mundos ficticios no está sujeto a verificación externa, lo que incrementa el riesgo de inconsistencias.
- El modelo no está validado en entornos de producción; cuenta con 0 descargas y no ha sido evaluado por la comunidad.
- La licencia Apache 2.0 del adaptador permite uso comercial, pero el modelo base Gemma-4 está sujeto a los términos de uso de Gemma, que deben cumplirse.

## Enlaces

- HuggingFace: https://huggingface.co/TILKI-AI/locations-generation-v2-E4B-lora
- Colección Locations de TILKI-AI: https://huggingface.co/collections/TILKI-AI/locations
- Sitio web de TILKI: https://www.tilki.com/
