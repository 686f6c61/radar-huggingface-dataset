# Timetocreate7777/Director_AI_PED_Qwen3.5-4B_Interpreter_LoRA

## Resumen

Director AI P-E-D Qwen3.5-4B Interpreter LoRA es un adaptador PEFT LoRA desarrollado por Timetocreate7777 para interpretar peticiones de cámara en lenguaje natural y convertirlas en coordenadas estructuradas de Posición, Elevación y Distancia (P-E-D). Este adaptador no es un modelo de generación de imágenes, sino un componente de interpretación de lenguaje para el flujo de control de imagen de Director AI en ComfyUI.

El modelo base es `unsloth/Qwen3.5-4B`, un modelo de lenguaje de tipo transformer. El adaptador se entrena para reconocer ocho posiciones horizontales (P1-P8), seis niveles de elevación (E0-E5) y tres distancias (D1-D3), y devuelve códigos como `P3-E3-D2`. Su objetivo es evitar que el usuario tenga que escribir prompts de cámara largos y específicos, permitiendo seleccionar la vista mediante lenguaje natural o desplegables.

La relevancia actual del modelo radica en su integración con el nodo personalizado de Director AI en ComfyUI, donde las coordenadas generadas se convierten de forma determinista en instrucciones para el flujo de generación de imagen. El repositorio ocupa 0,1 GB e incluye el adaptador, la configuración y el workflow JSON. No se especifica la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEFT LoRA adapter sobre Qwen3.5-4B (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA de 0,1 GB; el modelo base se denomina Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`adapter_model.safetensors`), `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json` |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT LoRA que se carga sobre el modelo base `unsloth/Qwen3.5-4B`. Los pesos entrenados son de bajo rango y no sustituyen al modelo base. El adaptador se entrenó únicamente para interpretar peticiones de cámara y devolver coordenadas dentro del sistema P-E-D; no se entrenó ningún modelo de imagen.

El conjunto de datos final de entrenamiento contiene 5.142 conversaciones y 240 casos de evaluación separados. Según la documentación, se conservaron 3.126 ejemplos corregidos de un entrenamiento anterior y se añadió cobertura equilibrada para P1-P8, E0-E5 y D1-D3. Los ejemplos incluyen peticiones de coordenadas, descripciones en lenguaje natural y metadatos de respuesta estructurados. El procedimiento documentado usa LoRA con rango 16, implementado con Transformers, PEFT y Unsloth. No se proporcionan más detalles sobre la composición exacta del dataset ni sobre el número total de tokens.

## Capacidades

- Interpreta peticiones de cámara en lenguaje natural y devuelve coordenadas P-E-D, como `P3-E3-D2`.
- Reconoce 8 posiciones horizontales (P1-P8), 6 niveles de elevación (E0-E5) y 3 distancias (D1-D3).
- Soporta modo desplegable determinista, que no requiere el modelo, y modo lenguaje natural, que utiliza el LoRA.
- Se integra con el nodo personalizado de Director AI en ComfyUI, que convierte las coordenadas en instrucciones deterministas para el flujo de generación de imagen.
- El nodo personalizado se encarga de las correcciones exactas de prompts, el cumplimiento de perfiles, el nombrado de salidas y los metadatos del workflow, sin depender de que el modelo calcule esos valores.
- No es un modelo de imagen: no genera imágenes por sí mismo.
- No soporta tool calling, agentes ni razonamiento multi-step general.
- Capacidades multilingues limitadas al inglés.

## Casos de uso

- Control de cámara en flujos de ComfyUI: el usuario escribe "vista desde la derecha, elevada y a distancia media" y el adaptador devuelve `P3-E3-D2`. El nodo personalizado aplica esa coordenada al workflow de Director AI, lo que permite controlar la cámara sin escribir prompts complejos.
- Generación de storyboards de personajes: un script puede llamar al modelo para traducir descripciones como "plano frontal, nivel de ojos, distancia cercana" a coordenadas P-E-D y generar múltiples vistas para un mismo personaje.
- Interfaz de usuario para diseño de producto: un usuario no técnico selecciona el ángulo de cámara mediante texto, mientras el sistema mantiene el control determinista del flujo de imagen, reduciendo errores de prompt.
- Automatización de pruebas de control de cámara: el adaptador se puede usar para validar que descripciones en lenguaje natural producen las coordenadas esperadas dentro del sistema P-E-D, en un pipeline de testing de prompts.
- Creación de variaciones de imagen para catálogos: combinado con la LoRA de imagen de múltiples ángulos, permite generar imágenes de un objeto desde distintas posiciones y distancias usando descripciones sencillas.
- Investigación en interfaces de control de cámara: sirve como componente de referencia para estudiar la traducción de lenguaje natural a coordenadas estructuradas en flujos de edición de imagen y para comparar modos de interacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador LoRA ocupa 0,1 GB, pero la VRAM total depende del modelo base Qwen3.5-4B y de la cuantizacion, que no se documentan en esta ficha.
- GPU recomendada: no disponible.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: se carga con Transformers y PEFT, usando Unsloth. El flujo de ComfyUI requiere el nodo personalizado incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. Este adaptador es especifico del sistema Director AI P-E-D y no es un modelo base de proposito general.

## Limitaciones y advertencias

- No es un modelo de generacion de imagenes; no produce imagenes por si mismo.
- No es un sustituto de la Qwen Image Edit 2511 Multiple-Angles LoRA, que se requiere para la transformacion real de la vista de camara.
- El modelo base y la LoRA de imagen de terceros no estan incluidos en este repositorio; hay que descargarlos desde sus fuentes oficiales y respetar sus licencias.
- La elevacion E5 se describe como "Extreme Elevated View" y no garantiza una vista totalmente cenital; las pruebas indicaron que la LoRA de imagen no mantiene de forma consistente una posicion vertical exacta a 90 grados.
- El adaptador esta entrenado solo en ingles, por lo que puede fallar con peticiones en otros idiomas.
- Riesgo de alucinacion en descripciones ambiguas, fuera del vocabulario P-E-D o que no sigan el esquema documentado.
- No se documentan sesgos especificos, pero al ser un adaptador de dominio estrecho puede comportarse de forma impredecible con entradas fuera de su funcion prevista.
- No debe usarse en decisiones autonomas de seguridad critica ni como sistema general de chat o instrucciones.
- No debe usarse sin modificaciones con sistemas de coordenadas de camara no relacionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timetocreate7777/Director_AI_PED_Qwen3.5-4B_Interpreter_LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Workflow incluido: `Director_AI_Qwen_image_control.json` (en el repositorio del modelo)
- Repositorio de GitHub: no disponible; el autor indica que el enlace se anadira tras la publicacion.
