# ziyodev/ovoz-tts

## Resumen

ovoz-tts es un repositorio de modelos de síntesis de voz (text-to-speech) para uzbeko, empaquetados en formato ONNX para inferencia completamente offline. No se trata de un modelo entrenado desde cero por el autor del repositorio, sino de una copia sin modificar de los modelos Gapiring desarrollados por el equipo Gapi (gapi.uz), redistribuida por Ziyodullo para que su paquete Python `ovoz` no dependa del repositorio original. El repositorio incluye tres variantes con distintos compromisos entre tamano y calidad: Edge v2 (118 MB, int8), Large v2 (346 MB, int8) y Nano v1 (31 MB mas 15 MB de vocabulario).

La relevancia de este repositorio es practica: ofrece TTS en uzbeko ejecutable en dispositivos de gama baja, telefonos o navegador, sin conexion a red. Gapiring es una adaptacion de Kyutai Pocket TTS (CC BY 4.0) y Nano se basa en tiny-voca (Apache 2.0), lo que situa la estirpe tecnica en modelos ligeros orientados a sintesis eficiente. El repositorio ocupa 0,5 GB e incluye dos voces (f1 femenina, m1 masculina), cinco roles y mas de veinte estilos de entonacion.

La informacion disponible no detalla la arquitectura interna ni los datos de entrenamiento; la model card se limita a describir el empaquetado, el uso mediante el paquete `ovoz` y las licencias. Esta ficha refleja, por tanto, unicamente lo documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Kyutai Pocket TTS y tiny-voca; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | int8 en las variantes Edge v2 y Large v2; Nano v1 sin cuantizacion indicada; el repositorio original dispone de una version Large a plena precision (1,3 GB) no incluida aqui |
| Idiomas soportados | uzbeko (uz) |
| Licencia | CC BY 4.0 (ficheros de modelo y voces); componentes derivados con Apache 2.0 (tiny-voca) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,5 GB |
| Variantes incluidas | edge/ (118 MB), large/ (346 MB), nano/ (31 MB + 15 MB de vocabulario) |
| Voces | f1 (femenina), m1 (masculina) |
| Estilos y roles | 5 roles, mas de 20 estilos de entonacion |
| Modelos base | islomov/gapi-uz-gapiring-v2 (rev 71708521), islomov/gapi-uz-gapiring-nano-v1 (rev cd9f1ef9) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de los modelos. Lo unico documentado es su procedencia: Gapiring es una adaptacion de Kyutai Pocket TTS, un sistema TTS ligero publicado bajo CC BY 4.0, y Gapiring Nano se basa en tiny-voca, publicado bajo Apache 2.0. El autor del repositorio indica explicitamente que los ficheros son copias sin modificar de los modelos originales de Gapi, por lo que cualquier detalle de arquitectura, datos de entrenamiento o proceso de ajuste (RLHF, DPO u otras tecnicas) corresponde al repositorio de origen y no se recoge en esta ficha.

El empaquetado en ONNX y las cuantizaciones int8 de las variantes Edge y Large apuntan a un diseno orientado a inferencia en CPU y dispositivos de recursos limitados. La existencia de una version Large a plena precision (1,3 GB) en el repositorio original, no incluida en esta copia, sugiere que la cuantizacion int8 es el mecanismo principal de reduccion de tamano en las variantes aqui distribuidas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni las tecnicas de alineacion empleadas.

## Capacidades

- Sintesis de voz a partir de texto en uzbeko, con salida en formato de audio (el ejemplo de la model card genera un fichero `.ogg`).
- Dos voces predefinidas: `f1` (femenina) y `m1` (masculina).
- Cinco roles y mas de veinte estilos de entonacion seleccionables (por ejemplo, `style="warm"` en el ejemplo de uso).
- Inferencia completamente offline: los modelos ONNX no requieren conexion a red ni servicios externos.
- Tres perfiles de despliegue segun recursos: Edge (rapido, orientado a telefono y navegador), Large (mayor calidad de voz) y Nano (el mas pequeno, con una sola voz).
- Integracion mediante el paquete Python `ovoz`, que expone una clase `TTS` con seleccion de variante, voz y estilo.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio de entrada ni generacion de texto; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido en aplicaciones moviles offline: la variante Edge (118 MB, int8) esta pensada para funcionar en telefonos sin conexion, lo que permite narrar articulos, notificaciones o interfaces en uzbeko dentro de apps que no pueden depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: el modelo puede convertir texto de pantalla en audio en tiempo real en dispositivos de gama baja, usando Nano (31 MB) cuando el espacio de almacenamiento es critico.
- Asistentes de voz locales para uzbeko: al ejecutarse sobre ONNX sin red, puede integrarse en asistentes de escritorio o domoticos que requieran privacidad y baja latencia, con seleccion de voz f1 o m1 segun preferencia del usuario.
- Generacion de audiolibros y material educativo: la variante Large (346 MB) ofrece una voz mas limpia, adecuada para producir narraciones de larga duracion con estilos de entonacion configurables que evitan la monotonia.
- Sistemas de anuncios y senaletica en espacios publicos: con mas de veinte estilos y cinco roles, se pueden generar avisos pregrabados con distintos tonos (informativo, calido, urgente) para estaciones, aeropuertos o comercios.
- Prototipado rapido de productos de voz para el mercado uzbeko: el paquete `ovoz` permite en pocas lineas generar muestras de audio para validar ideas antes de invertir en infraestructura de TTS propietaria.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: al ser ficheros ONNX deterministas y ligeros, se pueden ejecutar en contenedores para verificar que las actualizaciones de texto producen la locucion esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamano de los ficheros, la variante Nano (31 MB + 15 MB de vocabulario) y Edge (118 MB) son compatibles con ejecucion en CPU; Large (346 MB) tambien cabe holgadamente en memoria de sistema de cualquier equipo moderno.
- GPU recomendadas: no se especifican. Al ser modelos ONNX de pequeno tamano, no requieren GPU dedicada; pueden ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede acelerar la inferencia mediante los execution providers de ONNX Runtime, pero no se documentan requisitos minimos.
- Compatibilidad con GPU consumer: si, todas las variantes caben en cualquier GPU consumer actual e incluso en dispositivos moviles en el caso de Edge y Nano.
- Opciones de despliegue: ONNX Runtime a traves del paquete Python `ovoz` (`pip install ovoz`); al ser formato ONNX, es tecnicamente desplegable con cualquier runtime compatible con ONNX (ONNX Runtime, etc.), aunque la model card solo documenta la via del paquete `ovoz`.
- Latencia y throughput estimados: no disponibles. La model card describe Edge como "rapido, nivel telefono/navegador" y Large como de "voz mas limpia", sin cifras.

## Comparativa con modelos similares

| Modelo | Idiomas | Tamano | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ovoz-tts (este repositorio) | uzbeko | 0,5 GB (repo); variantes de 31 MB a 346 MB | ONNX | CC BY 4.0 | Hugging Face (ziyodev/ovoz-tts) |
| islomov/gapi-uz-gapiring-v2 | uzbeko | incluye version a plena precision de 1,3 GB | no disponible en la informacion | CC BY 4.0 (segun la model card de ovoz-tts) | Hugging Face (islomov/gapi-uz-gapiring-v2) |
| islomov/gapi-uz-gapiring-nano-v1 | uzbeko | 31 MB + 15 MB de vocabulario | no disponible en la informacion | CC BY 4.0 (segun la model card de ovoz-tts) | Hugging Face (islomov/gapi-uz-gapiring-nano-v1) |
| Kyutai Pocket TTS | no disponible en la informacion | no disponible | no disponible | CC BY 4.0 | Hugging Face (kyutai/pocket-tts) |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros sistemas TTS en uzbeko.

## Limitaciones y advertencias

- Cobertura linguistica limitada al uzbeko; no se documenta soporte para otros idiomas.
- Al ser una copia sin modificar de modelos de terceros, el autor del repositorio no ofrece garantias sobre calidad, sesgos o comportamiento del modelo; las limitaciones reales son las de Gapiring y sus bases (Kyutai Pocket TTS y tiny-voca).
- No se documentan sesgos conocidos, tasas de alucinacion ni metricas de fidelidad de la sintesis; en TTS, los fallos tipicos serian pronunciacion incorrecta de nombres propios, numeros y palabras extranjeras, pero no hay datos especificos en la informacion disponible.
- La licencia CC BY 4.0 exige atribucion: al redistribuir los ficheros o el audio generado hay que conservar la linea de autoria "Gapiring by Gapi (https://gapi.uz), an adaptation of Kyutai Pocket TTS, CC BY 4.0" y la correspondiente a Nano. El componente tiny-voca esta bajo Apache 2.0, cuyos textos de licencia se incluyen en `nano/LICENSE-tiny-voca`.
- El uso comercial esta permitido por CC BY 4.0 siempre que se respete la atribucion, pero conviene revisar los textos de licencia originales incluidos en el repositorio (`LICENSE-gapiring`, `nano/LICENSE`, `nano/LICENSE-tiny-voca`).
- La version Large a plena precision (1,3 GB) no esta incluida en esta copia; quien la necesite debe acudir al repositorio original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (27 de noviembre de 2026), por lo que no cuenta con validacion de la comunidad.
- La documentacion esta redactada en uzbeko, lo que puede dificultar su adopcion por parte de equipos que no dominen el idioma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ziyodev/ovoz-tts
- Paquete Python ovoz (GitHub): https://github.com/Ziyodullodev/ovoz
- Modelo base Gapiring v2: https://huggingface.co/islomov/gapi-uz-gapiring-v2
- Modelo base Gapiring Nano v1: https://huggingface.co/islomov/gapi-uz-gapiring-nano-v1
- Kyutai Pocket TTS (base de Gapiring): https://huggingface.co/kyutai/pocket-tts
- tiny-voca (base de Gapiring Nano): https://github.com/n4ze3m/tiny-voca
- Gapi (autor original): https://gapi.uz
