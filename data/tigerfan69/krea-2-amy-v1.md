# TigerFan69/Krea-2-Amy-v1

## Resumen

Krea 2 Amy v1 es un adaptador LoRA de personaje para el modelo base Krea 2, desarrollado por el usuario TigerFan69. No es un modelo completo, sino un adaptador de bajo rango que se aplica sobre Krea 2 (y, segun la ficha del autor, tambien Krea 2 Turbo) para generar retratos y escenas consistentes de Amy, un personaje ficticio adulto definido por el creador. El repositorio ocupa 0,1 GB y contiene un unico archivo SafeTensor de 114.324.752 bytes (unos 109 MB) en fp16.

El adaptador se entrena con AI Toolkit 0.13.30 durante 2.000 pasos (epoca 99) y contiene 512 tensores. Su funcion es fijar la identidad visual del personaje mediante una palabra de activacion, de modo que el usuario pueda reutilizar la misma cara y estilo en distintas composiciones sin reentrenar. Es relevante para quienes trabajan con Krea 2 en flujos de generacion de personajes consistentes, ya que el ecosistema de LoRAs de personaje para este modelo base aun es reducido.

La licencia es la Krea 2 Community License, con restricciones adicionales impuestas por el creador (prohibicion de fusionar y compartir merges, de vender imagenes generadas, de usar el adaptador en otros servicios de generacion y de vender el adaptador o sus merges). El modelo solo declara soporte de ingles y esta pensado para generacion texto-a-imagen, no para tareas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura del base no disponible |
| Parametros totales | 512 tensores; 114.324.752 bytes en fp16 (no se especifica el numero de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible; el archivo publicado es fp16 SafeTensor |
| Idiomas soportados | en (ingles) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) con terminos adicionales del creador |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un transformer completo: modifica un subconjunto de pesos del modelo base Krea 2 mediante matrices de bajo rango. El archivo contiene 512 tensores en fp16. Segun los metadatos incluidos en la model card, el entrenamiento se realizo con AI Toolkit 0.13.30 durante 2.000 pasos, alcanzando la epoca 99, y el adaptador es identico al archivo original publicado en Civitai.

No se detalla la composicion del dataset de entrenamiento, el numero de imagenes, la resolucion ni si se aplicaron tecnicas de regularizacion o captions especificos. El autor indica explicitamente que no se incluye informacion de entrenamiento ni el flujo de generacion completo. La unica innovacion destacable es el uso de una palabra de activacion ("Amyv1") para invocar la identidad del personaje, practica habitual en LoRAs de personaje.

## Capacidades

- Generacion texto-a-imagen de un personaje ficticio consistente (Amy) sobre el modelo base Krea 2.
- Retratos y escenas del personaje en distintos contextos mediante prompts descriptivos.
- Control de intensidad mediante el parametro de fuerza (strength) del LoRA en el flujo de trabajo.
- Compatibilidad declarada por el autor con Krea 2 y Krea 2 Turbo; los metadatos del adaptador identifican Krea 2.
- Integracion en ComfyUI mediante la carpeta `models/loras/`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues mas alla del ingles.
- No incluye capacidades de vision, audio ni modo de razonamiento.

## Casos de uso

- Ilustracion de personajes para narrativa serial: mantener la misma identidad visual de Amy a lo largo de capitulos o escenas usando la palabra de activacion "Amyv1" y variando solo el resto del prompt.
- Creacion de avatares y retratos de perfil: generar retratos fotograficos con luz natural (`portrait photograph, natural daylight`) para uso en fichas de personaje o material promocional de ficcion.
- Storyboarding de proyectos creativos: producir variaciones de una misma escena (vestuario, entorno, encuadre) con coherencia de personaje para previsualizar una historia antes de producir arte final.
- Prototipado rapido en ComfyUI: integrar el LoRA en un flujo existente de Krea 2 y ajustar fuerza, prompt y semilla para explorar direcciones visuales en pocos minutos.
- Contenido para comunidades de rol y ficcion: generar imagenes del personaje para partidas, foros o publicaciones, respetando la restriccion de no vender las imagenes generadas.
- Pruebas de concepto de personajes originales: usar el adaptador como referencia para disenar variantes del personaje o comparar estilos antes de encargar arte definitivo.
- Demostraciones tecnicas de LoRAs de personaje: servir de ejemplo de adaptador entrenado con AI Toolkit para quienes quieran replicar el proceso con sus propios personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa unos 109 MB (114.324.752 bytes) en fp16 y se carga junto al modelo base; la VRAM necesaria la determina Krea 2, no el LoRA.
- No se dispone de requisitos de VRAM del modelo base en la informacion proporcionada; consultar la ficha oficial de Krea 2.
- GPU recomendadas: no disponible para el adaptador; dependera del modelo base.
- No se confirma que quepa en GPU de consumo; depende del base y de su cuantizacion.
- Despliegue: ComfyUI con el adaptador en `models/loras/` y un flujo compatible de Krea 2 LoRA; otros runners no se mencionan.
- Latencia y throughput: no disponibles; el autor no declara valores de fuerza ni ajustes de generacion probados de forma independiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Amy v1 | LoRA de personaje sobre Krea 2 | 512 tensores, 109 MB fp16 | no aplica | Krea 2 Community License + terminos del creador | Hugging Face, Civitai, GitHub Releases, Ko-fi |
| Otros LoRAs de personaje para Krea 2 | LoRA de personaje | no disponible | no aplica | variable | no disponible |
| Modelos base de generacion texto-a-imagen | Modelo completo | no disponible | no aplica | variable | no disponible |

No se dispone de informacion sobre LoRAs de personaje comparables para Krea 2 ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar y ejecutar Krea 2 por separado bajo sus propios terminos.
- Solo declara soporte de ingles; los prompts en otros idiomas no estan garantizados.
- Riesgo de sobreajuste al personaje o de deriva de identidad segun la fuerza del LoRA, el prompt y la semilla; el autor no garantiza resultados identicos a la muestra incluida.
- No se documenta el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de representacion del personaje.
- La licencia Krea 2 Community License y su politica de uso aceptable se aplican al derivado; hay que leer LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes de usarlo.
- El creador prohibe compartir merges, vender imagenes generadas, usar el adaptador en otros servicios de generacion y vender el adaptador o sus merges; la generacion en Civitai si esta permitida.
- No es un producto oficial de Krea ni esta respaldado por Krea.
- El paquete no incluye imagenes explicitas, pero el personaje es ficticio y adulto; conviene verificar el cumplimiento de las politicas de la plataforma de despliegue.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Amy-v1
- Licencia (PDF): https://huggingface.co/TigerFan69/Krea-2-Amy-v1/blob/main/LICENSE.pdf
- GitHub Releases: https://github.com/TigerFan69/krea-character-loras/releases/tag/amy-v1
- Civitai: https://civitai.red/models/3018875
- Perfil Civitai: https://civitai.red/user/TigerFan69
- Perfil Hugging Face: https://huggingface.co/TigerFan69
- Ko-fi (descarga gratuita): https://ko-fi.com/s/45070710ea
- Ko-fi (soporte opcional): https://ko-fi.com/tigerfan69/tiers
