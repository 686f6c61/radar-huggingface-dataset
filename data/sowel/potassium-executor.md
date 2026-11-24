# sowel/potassium-executor

## Resumen

`sowel/potassium-executor` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un ejecutor para Windows (un binario de tipo "Roblox executor") distribuido como archivo ZIP. El autor del repositorio es el usuario `sowel`, y la model card se presenta con un formato de pagina de descarga de software con distintivos, contrasenas de descompresion y enlaces a binarios alojados en GitHub. No existe ninguna evidencia de pesos, arquitectura de red neuronal, tokenizador ni pipeline de inferencia.

La ficha se ha redactado a partir de la informacion disponible en Hugging Face y en la model card publica. La mayoria de los campos tecnicos propios de un modelo (parametros, contexto, cuantizacion, licencia de pesos) no son aplicables o no estan disponibles, y se indican como tales de forma explicita. Se advierte de que el contenido del repositorio presenta caracteristicas asociadas a la distribucion de software potencialmente no deseado (contrasena en el archivo, instrucciones para desactivar avisos de SmartScreen, enlaces a binarios externos), por lo que no debe tratarse como un modelo evaluable.

Esta ficha no constituye una recomendacion de uso. Se limita a documentar lo que el repositorio declara y a senalar las lagunas de informacion existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutor binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (segun metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No disponible. El repositorio no describe ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de preentrenamiento, ajuste fino, RLHF ni DPO. El contenido de la model card describe funcionalidades de un ejecutor de scripts (sincronizacion de offsets, editor Monaco, adjuncion multi-instancia, directorio de auto-ejecucion), no un modelo de lenguaje.

No se ha publicado informacion sobre tokens de entrenamiento, composicion del corpus ni innovaciones tecnicas de modelado.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio declara funcionalidades de ejecucion de scripts sobre un cliente de Roblox (editor Monaco, adjuncion multi-instancia, auto-ejecucion), que no son capacidades de un modelo de IA.
- Los idiomas listados en los metadatos (14 idiomas) no van acompanados de ninguna evaluacion de competencia linguistica.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA, ya que el repositorio no contiene un modelo. A continuacion se enumeran los escenarios que la model card sugiere, exclusivamente a efectos descriptivos y sin recomendacion de uso:

- Ejecucion de scripts sobre el cliente de un videojuego: la model card describe un "script hub" integrado y adjuncion al proceso del cliente; este tipo de herramientas suele contravenir los terminos de servicio de los juegos y puede conllevar el baneo de cuentas.
- Automatizacion de tareas dentro del cliente: se menciona un directorio de auto-ejecucion y recarga automatica de scripts.
- Edicion de scripts en un entorno tipo Monaco: se describe un espacio de trabajo con resaltado de sintaxis y traza de consola.
- Ejecucion multi-instancia: se menciona la adjuncion simultanea a varios clientes.
- Sincronizacion tras actualizaciones del cliente: se describe una actualizacion automatica de firmas los miercoles.
- Distribucion de binarios para Windows 10/11: el repositorio se presenta como paquete portable con contrasena de descompresion.

Ninguno de estos escenarios corresponde a un uso de modelo de lenguaje y varios de ellos presentan riesgos de seguridad y de cumplimiento de terminos de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable (no es un modelo de IA).
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponible; la model card cita cifras de sondeo ("375 Hz") y consumo de RAM ("< 62 MB", "< 40 MB") que no son verificables ni corresponden a inferencia de un modelo.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), arquitectura x64.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable, ya que el repositorio no contiene un modelo. Tampoco se han identificado en la informacion proporcionada alternativas equivalentes de software con las que establecer una comparacion tecnica fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuracion, tokenizador ni pipeline. Cualquier evaluacion como modelo es imposible con la informacion disponible.
- La model card incluye instrucciones para descomprimir con contrasena, ejecutar como administrador y desactivar o ignorar avisos de Windows Defender y SmartScreen; estas practicas son caracteristicas de campanas de distribucion de software potencialmente no deseado o malicioso.
- Los binarios se alojan en enlaces externos a GitHub que no coinciden con el identificador del repositorio de Hugging Face (`pedrolong1343/...` frente a `sowel/...`), lo que impide verificar la autoria y la integridad del paquete.
- Las cifras de rendimiento y los distintivos de descargas y valoracion de la model card no son verificables y no deben tomarse como datos contrastados.
- La licencia MIT declarada en los metadatos no aclara la situacion legal del binario distribuido ni de los scripts que ejecuta.
- El uso de ejecutores sobre clientes de videojuegos puede infringir los terminos de servicio correspondientes y exponer al usuario a sanciones y a riesgos de seguridad.
- No se dispone de informacion sobre sesgos, alucinacion ni limitaciones linguisticas porque no hay un modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sowel/potassium-executor
- Model card (referencia interna del repositorio): https://huggingface.co/sowel/potassium-executor/blob/main/README.md
- Enlace de descarga citado en la model card (externo, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card (externo, no verificado): https://github.com/Persson754/potassium-executor
- Resultados de busqueda web: no relevantes para el modelo; los enlaces devueltos corresponden a una cadena hotelera francesa (sowell.fr) y a una aplicacion de gestion de equipos (sowell.app), sin relacion con el repositorio.
